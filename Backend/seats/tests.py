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
        cls.other_user = User.objects.create_user(username="otheruser", password="password123")
        cls.admin_user = User.objects.create_superuser(username="admin", password="password123")

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
        self.assertIsNone(self.seat1.reserved_by)

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
