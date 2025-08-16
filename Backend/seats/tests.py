# seats/tests.py

from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Seat


class SeatAPITests(APITestCase):
    user: User
    other_user: User
    admin_user: User
    seat1: Seat
    seat2: Seat

    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user(username="testuser", password="password123")
        cls.other_user = User.objects.create_user(
            username="otheruser", password="password123"
        )
        cls.admin_user = User.objects.create_superuser(
            username="admin", password="password123"
        )

        # seat_number를 마이그레이션과 겹치지 않는 '숫자'로 생성합니다.
        cls.seat1 = Seat.objects.create(seat_number=10)
        cls.seat2 = Seat.objects.create(
            seat_number=11, is_reserved=True, reserved_by=cls.other_user
        )

    def test_get_seat_list(self):
        """좌석 목록 조회 테스트"""
        url = "/api/seats/"
        # 데이터 마이그레이션(9개) + 테스트 데이터(2개) = 총 11개
        # 여기서는 단순히 API가 정상 동작하는지만 확인합니다.
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_reservation_flow(self):
        """좌석 예약, 내 예약 조회, 타인 예약 취소 실패, 본인 예약 취소 성공 흐름 테스트"""
        # === 1. 로그인 및 토큰 획득 ===
        login_response = self.client.post(
            "/api/users/login/", {"username": "testuser", "password": "password123"}
        )
        token = login_response.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        # === 2. 빈 좌석(10번) 예약 (성공) ===
        reserve_url = "/api/seats/reserve/"
        reserve_data = {"seat_number": self.seat1.seat_number}

        response = self.client.post(reserve_url, reserve_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.seat1.refresh_from_db()
        self.assertTrue(self.seat1.is_reserved)
        self.assertEqual(self.seat1.reserved_by, self.user)

        # === 3. 이미 예약된 좌석 예약 (실패) ===
        response = self.client.post(reserve_url, reserve_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)

        # === 4. 내 예약 목록 조회 (성공) ===
        my_reservations_url = "/api/users/me/reservations/"
        response = self.client.get(my_reservations_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(
            response.data[0]["seat_number"], (self.seat1.seat_number)
        )  # JSON 응답은 문자열일 수 있으므로 str()로 비교

        # === 5. 다른 유저가 내 예약 취소 (실패) ===
        other_user_login = self.client.post(
            "/api/users/login/", {"username": "otheruser", "password": "password123"}
        )
        other_token = other_user_login.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {other_token}")

        cancel_url = f"/api/seats/{self.seat1.seat_number}/cancel/"
        response = self.client.delete(cancel_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # === 6. 본인이 예약 취소 (성공) ===
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        response = self.client.delete(cancel_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.seat1.refresh_from_db()
        self.assertFalse(self.seat1.is_reserved)

    def test_single_user_reservation(self):
        """단일 유저로 예약이 작동하는지 테스트"""
        # 테스트용 좌석 생성
        test_seat = Seat.objects.create(seat_number=888)

        # 테스트 유저 생성 및 로그인
        test_user = User.objects.create_user(
            username="single_test_user", password="password123"
        )

        login_response = self.client.post(
            "/api/users/login/",
            {"username": test_user.username, "password": "password123"},
        )
        token = login_response.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        # 예약 시도
        response = self.client.post(
            "/api/seats/reserve/", {"seat_number": test_seat.seat_number}, format="json"
        )

        print(f"\n=== 단일 유저 예약 테스트 결과 ===")
        print(f"응답 상태 코드: {response.status_code}")
        print(f"응답 데이터: {response.data}")

        # 응답 확인
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 좌석 상태 확인
        test_seat.refresh_from_db()
        self.assertTrue(test_seat.is_reserved)
        self.assertEqual(test_seat.reserved_by, test_user)

    def test_reset_seats_permission(self):
        """좌석 초기화 권한 테스트 (관리자만 성공)"""
        reset_url = "/api/seats/reset/"

        # --- 일반 유저로 시도 (실패) ---
        user_login = self.client.post(
            "/api/users/login/", {"username": "testuser", "password": "password123"}
        )
        user_token = user_login.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {user_token}")

        response = self.client.post(reset_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # --- 관리자로 시도 (성공) ---
        admin_login = self.client.post(
            "/api/users/login/", {"username": "admin", "password": "password123"}
        )
        admin_token = admin_login.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {admin_token}")

        # 초기화를 위해 먼저 좌석 하나를 예약 상태로 변경
        self.seat1.is_reserved = True
        self.seat1.save()

        response = self.client.post(reset_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.seat1.refresh_from_db()
        self.assertFalse(self.seat1.is_reserved)

    def test_random_failure_500_error(self):
        """1% 확률로 실패하는 로직이 500 에러를 반환하는지 테스트"""
        # 테스트용 좌석 생성
        test_seat = Seat.objects.create(seat_number=999)

        # 테스트 유저 생성 및 로그인
        test_user = User.objects.create_user(
            username="failure_test_user", password="password123"
        )

        login_response = self.client.post(
            "/api/users/login/",
            {"username": test_user.username, "password": "password123"},
        )
        token = login_response.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        # 예약 시도 (1% 확률로 실패하는 로직이 있음)
        reserve_url = "/api/seats/reserve/"
        reserve_data = {"seat_number": test_seat.seat_number}

        # 여러 번 시도하여 실패 케이스 발생시키기
        max_attempts = 200  # 충분한 시도 횟수
        success_count = 0
        failure_count = 0

        for attempt in range(max_attempts):
            response = self.client.post(reserve_url, reserve_data, format="json")

            if response.status_code == status.HTTP_200_OK:
                success_count += 1
                # 성공한 경우 좌석 초기화하여 다시 시도할 수 있도록 함
                test_seat.is_reserved = False
                test_seat.reserved_by = None
                test_seat.save()
            elif response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR:
                failure_count += 1
                # 실패한 경우 좌석 상태 확인
                test_seat.refresh_from_db()
                self.assertFalse(
                    test_seat.is_reserved, "실패 시 좌석이 예약되지 않아야 합니다"
                )
                self.assertIsNone(
                    test_seat.reserved_by, "실패 시 예약자가 없어야 합니다"
                )
            else:
                self.fail(f"예상치 못한 응답 코드: {response.status_code}")

        # 검증: 성공과 실패가 모두 발생했는지 확인
        self.assertGreater(success_count, 0, "성공 케이스가 발생해야 합니다")
        self.assertGreater(failure_count, 0, "실패 케이스가 발생해야 합니다")

        # 검증: 실패율이 대략적으로 1%에 근접하는지 확인 (통계적 검증)
        failure_rate = failure_count / max_attempts
        print(f"\n=== 1% 확률 실패 테스트 결과 ===")
        print(f"총 시도: {max_attempts}회")
        print(f"성공: {success_count}회")
        print(f"실패: {failure_count}회")
        print(f"실패율: {failure_rate*100:.2f}%")

        # 실패율이 0.5% ~ 2% 범위 내에 있는지 확인 (통계적 허용 오차)
        self.assertGreaterEqual(failure_rate, 0.005, "실패율이 너무 낮습니다")
        self.assertLessEqual(failure_rate, 0.02, "실패율이 너무 높습니다")

        print("✅ 1% 확률 실패 테스트 통과!")


class SeatIntegrationTests(APITestCase):
    """좌석 예약 시스템의 통합 테스트"""

    user: User
    other_user: User
    admin_user: User

    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user(
            username="integration_user", password="password123"
        )
        cls.other_user = User.objects.create_user(
            username="integration_other", password="password123"
        )
        cls.admin_user = User.objects.create_superuser(
            username="integration_admin", password="password123"
        )

    def test_complete_reservation_workflow(self):
        """완전한 좌석 예약 워크플로우 테스트"""
        print("\n=== 완전한 좌석 예약 워크플로우 테스트 ===")

        # 1. 사용자 로그인
        login_response = self.client.post(
            "/api/users/login/",
            {"username": "integration_user", "password": "password123"},
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        token = login_response.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        print("✅ 사용자 로그인 성공")

        # 2. 좌석 목록 조회
        seats_response = self.client.get("/api/seats/")
        self.assertEqual(seats_response.status_code, status.HTTP_200_OK)
        initial_seats_count = len(seats_response.data)
        print(f"✅ 좌석 목록 조회 성공 (총 {initial_seats_count}개)")

        # 3. 빈 좌석 찾기
        available_seat = None
        for seat_data in seats_response.data:
            if not seat_data["is_reserved"]:
                available_seat = seat_data
                break

        self.assertIsNotNone(available_seat, "예약 가능한 좌석이 있어야 합니다")
        print(f"✅ 예약 가능한 좌석 발견: {available_seat['seat_number']}번")

        # 4. 좌석 예약
        reserve_response = self.client.post(
            "/api/seats/reserve/",
            {"seat_number": available_seat["seat_number"]},
            format="json",
        )

        if reserve_response.status_code == status.HTTP_200_OK:
            print(f"✅ 좌석 {available_seat['seat_number']}번 예약 성공")
        elif reserve_response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR:
            print(f"⚠️ 좌석 {available_seat['seat_number']}번 예약 실패 (1% 확률)")
            # 실패한 경우 다른 좌석 시도
            for seat_data in seats_response.data:
                if (
                    not seat_data["is_reserved"]
                    and seat_data["seat_number"] != available_seat["seat_number"]
                ):
                    available_seat = seat_data
                    break

            reserve_response = self.client.post(
                "/api/seats/reserve/",
                {"seat_number": available_seat["seat_number"]},
                format="json",
            )
            self.assertEqual(reserve_response.status_code, status.HTTP_200_OK)
            print(f"✅ 대체 좌석 {available_seat['seat_number']}번 예약 성공")
        else:
            self.fail(f"예상치 못한 예약 응답: {reserve_response.status_code}")

        # 5. 예약된 좌석 목록 재조회
        updated_seats_response = self.client.get("/api/seats/")
        self.assertEqual(updated_seats_response.status_code, status.HTTP_200_OK)

        # 예약된 좌석 찾기
        reserved_seat = None
        for seat_data in updated_seats_response.data:
            if seat_data["seat_number"] == available_seat["seat_number"]:
                reserved_seat = seat_data
                break

        self.assertIsNotNone(reserved_seat, "예약된 좌석을 찾을 수 있어야 합니다")
        self.assertTrue(reserved_seat["is_reserved"], "좌석이 예약된 상태여야 합니다")
        print(f"✅ 좌석 {reserved_seat['seat_number']}번이 예약된 상태로 확인됨")

        # 6. 내 예약 목록 조회
        my_reservations_response = self.client.get("/api/users/me/reservations/")
        self.assertEqual(my_reservations_response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            len(my_reservations_response.data), 1, "예약 목록에 1개가 있어야 합니다"
        )

        reservation = my_reservations_response.data[0]
        self.assertEqual(reservation["seat_number"], available_seat["seat_number"])
        print(f"✅ 내 예약 목록에서 좌석 {reservation['seat_number']}번 확인")

        # 7. 예약 취소
        cancel_response = self.client.delete(
            f"/api/seats/{available_seat['seat_number']}/cancel/"
        )
        self.assertEqual(cancel_response.status_code, status.HTTP_200_OK)
        print(f"✅ 좌석 {available_seat['seat_number']}번 예약 취소 성공")

        # 8. 취소 후 좌석 상태 확인
        final_seats_response = self.client.get("/api/seats/")
        self.assertEqual(final_seats_response.status_code, status.HTTP_200_OK)

        cancelled_seat = None
        for seat_data in final_seats_response.data:
            if seat_data["seat_number"] == available_seat["seat_number"]:
                cancelled_seat = seat_data
                break

        self.assertIsNotNone(cancelled_seat, "취소된 좌석을 찾을 수 있어야 합니다")
        self.assertFalse(
            cancelled_seat["is_reserved"], "좌석이 예약되지 않은 상태여야 합니다"
        )
        print(f"✅ 좌석 {cancelled_seat['seat_number']}번이 취소된 상태로 확인됨")

        print("🎉 완전한 좌석 예약 워크플로우 테스트 통과!")

    def test_multi_user_reservation_scenario(self):
        """다중 사용자 예약 시나리오 테스트"""
        print("\n=== 다중 사용자 예약 시나리오 테스트 ===")

        # 사용자 1 로그인
        user1_login = self.client.post(
            "/api/users/login/",
            {"username": "integration_user", "password": "password123"},
        )
        user1_token = user1_login.data["access"]

        # 사용자 2 로그인
        user2_login = self.client.post(
            "/api/users/login/",
            {"username": "integration_other", "password": "password123"},
        )
        user2_token = user2_login.data["access"]

        print("✅ 두 사용자 로그인 성공")

        # 사용자 1이 좌석 예약
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {user1_token}")
        seats_response = self.client.get("/api/seats/")
        available_seat = None
        for seat_data in seats_response.data:
            if not seat_data["is_reserved"]:
                available_seat = seat_data
                break

        self.assertIsNotNone(available_seat, "예약 가능한 좌석이 있어야 합니다")

        reserve_response = self.client.post(
            "/api/seats/reserve/",
            {"seat_number": available_seat["seat_number"]},
            format="json",
        )

        if reserve_response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR:
            # 실패한 경우 다른 좌석 시도
            for seat_data in seats_response.data:
                if (
                    not seat_data["is_reserved"]
                    and seat_data["seat_number"] != available_seat["seat_number"]
                ):
                    available_seat = seat_data
                    break

            reserve_response = self.client.post(
                "/api/seats/reserve/",
                {"seat_number": available_seat["seat_number"]},
                format="json",
            )

        self.assertEqual(reserve_response.status_code, status.HTTP_200_OK)
        print(f"✅ 사용자 1이 좌석 {available_seat['seat_number']}번 예약 성공")

        # 사용자 2가 같은 좌석 예약 시도 (실패해야 함)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {user2_token}")
        conflict_response = self.client.post(
            "/api/seats/reserve/",
            {"seat_number": available_seat["seat_number"]},
            format="json",
        )
        self.assertEqual(conflict_response.status_code, status.HTTP_409_CONFLICT)
        print(
            f"✅ 사용자 2가 이미 예약된 좌석 {available_seat['seat_number']}번 예약 시도 실패 (409 Conflict)"
        )

        # 사용자 2가 다른 좌석 예약
        seats_response = self.client.get("/api/seats/")
        other_available_seat = None
        for seat_data in seats_response.data:
            if not seat_data["is_reserved"]:
                other_available_seat = seat_data
                break

        self.assertIsNotNone(
            other_available_seat, "다른 예약 가능한 좌석이 있어야 합니다"
        )

        other_reserve_response = self.client.post(
            "/api/seats/reserve/",
            {"seat_number": other_available_seat["seat_number"]},
            format="json",
        )

        if other_reserve_response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR:
            # 실패한 경우 다른 좌석 시도
            for seat_data in seats_response.data:
                if (
                    not seat_data["is_reserved"]
                    and seat_data["seat_number"] != other_available_seat["seat_number"]
                ):
                    other_available_seat = seat_data
                    break

            other_reserve_response = self.client.post(
                "/api/seats/reserve/",
                {"seat_number": other_available_seat["seat_number"]},
                format="json",
            )

        self.assertEqual(other_reserve_response.status_code, status.HTTP_200_OK)
        print(f"✅ 사용자 2가 좌석 {other_available_seat['seat_number']}번 예약 성공")

        # 각 사용자의 예약 목록 확인
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {user1_token}")
        user1_reservations = self.client.get("/api/users/me/reservations/")
        self.assertEqual(user1_reservations.status_code, status.HTTP_200_OK)
        self.assertEqual(len(user1_reservations.data), 1)

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {user2_token}")
        user2_reservations = self.client.get("/api/users/me/reservations/")
        self.assertEqual(user2_reservations.status_code, status.HTTP_200_OK)
        self.assertEqual(len(user2_reservations.data), 1)

        print("✅ 각 사용자의 예약 목록 확인 완료")
        print("🎉 다중 사용자 예약 시나리오 테스트 통과!")

    def test_admin_reset_functionality(self):
        """관리자 좌석 초기화 기능 테스트"""
        print("\n=== 관리자 좌석 초기화 기능 테스트 ===")

        # 일반 사용자로 좌석 예약
        user_login = self.client.post(
            "/api/users/login/",
            {"username": "integration_user", "password": "password123"},
        )
        user_token = user_login.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {user_token}")

        # 예약 가능한 좌석 찾기 및 예약
        seats_response = self.client.get("/api/seats/")
        available_seat = None
        for seat_data in seats_response.data:
            if not seat_data["is_reserved"]:
                available_seat = seat_data
                break

        self.assertIsNotNone(available_seat, "예약 가능한 좌석이 있어야 합니다")

        reserve_response = self.client.post(
            "/api/seats/reserve/",
            {"seat_number": available_seat["seat_number"]},
            format="json",
        )

        if reserve_response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR:
            # 실패한 경우 다른 좌석 시도
            for seat_data in seats_response.data:
                if (
                    not seat_data["is_reserved"]
                    and seat_data["seat_number"] != available_seat["seat_number"]
                ):
                    available_seat = seat_data
                    break

            reserve_response = self.client.post(
                "/api/seats/reserve/",
                {"seat_number": available_seat["seat_number"]},
                format="json",
            )

        self.assertEqual(reserve_response.status_code, status.HTTP_200_OK)
        print(f"✅ 일반 사용자가 좌석 {available_seat['seat_number']}번 예약 성공")

        # 일반 사용자로 초기화 시도 (실패해야 함)
        reset_response = self.client.post("/api/seats/reset/")
        self.assertEqual(reset_response.status_code, status.HTTP_403_FORBIDDEN)
        print("✅ 일반 사용자의 좌석 초기화 시도 실패 (403 Forbidden)")

        # 관리자로 로그인하여 초기화
        admin_login = self.client.post(
            "/api/users/login/",
            {"username": "integration_admin", "password": "password123"},
        )
        admin_token = admin_login.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {admin_token}")

        admin_reset_response = self.client.post("/api/seats/reset/")
        self.assertEqual(admin_reset_response.status_code, status.HTTP_200_OK)
        print("✅ 관리자가 좌석 초기화 성공")

        # 초기화 후 좌석 상태 확인
        final_seats_response = self.client.get("/api/seats/")
        self.assertEqual(final_seats_response.status_code, status.HTTP_200_OK)

        all_unreserved = True
        for seat_data in final_seats_response.data:
            if seat_data["is_reserved"]:
                all_unreserved = False
                break

        self.assertTrue(all_unreserved, "모든 좌석이 예약되지 않은 상태여야 합니다")
        print("✅ 모든 좌석이 초기화된 상태로 확인됨")

        print("🎉 관리자 좌석 초기화 기능 테스트 통과!")
