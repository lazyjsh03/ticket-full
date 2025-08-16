# users/views.py

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema, OpenApiParameter

from .serializers import UserSerializer


# 1. 회원가입 View
class SignupView(generics.CreateAPIView):
    """
    사용자 생성을 위한 회원가입 API
    """

    queryset = User.objects.all()
    serializer_class = UserSerializer
    # 회원가입은 인증되지 않은 사용자도 요청할 수 있어야 합니다.
    permission_classes = [AllowAny]


# 2. 로그인 View
class LoginView(APIView):
    """
    사용자 로그인을 위한 API. 성공 시 JWT 토큰(access, refresh)을 발급합니다.
    """

    permission_classes = [AllowAny]

    @extend_schema(request=UserSerializer)
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response(
                {"error": "Username and password are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Django의 authenticate() 함수로 사용자 인증
        user = authenticate(username=username, password=password)

        if user is not None:
            # 인증 성공 시, JWT 토큰 생성
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "message": "Login successful",
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                }
            )
        else:
            # 인증 실패 시
            return Response(
                {"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
            )
