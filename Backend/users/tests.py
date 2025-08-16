# users/tests.py

from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase


class UserAuthAPITests(APITestCase):
    def test_signup_success(self):
        """회원가입 성공 테스트"""
        # Arrange: 테스트를 위한 데이터 준비
        url = "/api/users/signup/"
        data = {"username": "testuser", "password": "testpassword123"}

        # Act: API 요청 실행
        response = self.client.post(url, data, format="json")

        # Assert: 결과 확인
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(User.objects.get().username, "testuser")
        # 응답 데이터에 password가 포함되지 않았는지 확인 (write_only=True 테스트)
        self.assertNotIn("password", response.data)

    def test_signup_fail_username_exists(self):
        """이미 존재하는 username으로 회원가입 시 실패 테스트"""
        # Arrange: 이미 존재하는 사용자 생성
        User.objects.create_user(username="testuser", password="testpassword123")
        url = "/api/users/signup/"
        data = {"username": "testuser", "password": "newpassword456"}  # 동일한 username

        # Act
        response = self.client.post(url, data, format="json")

        # Assert
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_success(self):
        """로그인 성공 및 토큰 발급 테스트"""
        # Arrange: 테스트용 사용자 생성
        test_username = "testuser"
        test_password = "testpassword123"
        User.objects.create_user(username=test_username, password=test_password)
        url = "/api/users/login/"
        data = {"username": test_username, "password": test_password}

        # Act
        response = self.client.post(url, data, format="json")

        # Assert
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # 응답에 access와 refresh 토큰이 포함되어 있는지 확인
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_login_fail_invalid_credentials(self):
        """잘못된 정보로 로그인 시 실패 테스트"""
        # Arrange
        User.objects.create_user(username="testuser", password="testpassword123")
        url = "/api/users/login/"
        data = {"username": "testuser", "password": "wrongpassword"}  # 잘못된 비밀번호

        # Act
        response = self.client.post(url, data, format="json")

        # Assert
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
