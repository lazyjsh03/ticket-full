# users/views.py

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from drf_spectacular.utils import OpenApiExample, extend_schema
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from seats.models import Seat
from seats.serializers import SeatSerializer

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

    @extend_schema(
        summary="User Signup",
        description="새로운 사용자를 생성합니다.",
        examples=[
            OpenApiExample(
                "Example for Signup",
                value={"username": "string", "password": "string"},
                request_only=True,
            )
        ],
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


# 2. 로그인 View
class LoginView(APIView):
    """
    사용자 로그인을 위한 API. 성공 시 JWT 토큰(access, refresh)을 발급합니다.
    """

    permission_classes = [AllowAny]

    @extend_schema(
        request=UserSerializer,
        summary="User Login",
        description="사용자 로그인을 처리하고 JWT 토큰을 발급합니다.",
        # examples 파라미터를 사용하여 직접 예시 값을 제공합니다.
        examples=[
            OpenApiExample(
                "Example for Login",
                # value에 원하는 JSON 예시를 그대로 작성합니다.
                value={"username": "string", "password": "string"},
                # 이 예시는 요청(request)에만 해당됨을 명시합니다.
                request_only=True,
            )
        ],
    )
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
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


class MyReservationsView(generics.ListAPIView):
    """
    현재 로그인된 사용자의 예매 좌석 목록을 반환합니다.
    """

    # 응답 데이터를 어떻게 직렬화할지 지정합니다. (SeatSerializer 재사용)
    serializer_class = SeatSerializer
    # 이 API는 반드시 인증된 사용자만 접근할 수 있습니다.
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="My Reserved Seats",
        description="현재 인증된 사용자가 예약한 모든 좌석의 목록을 조회합니다.",
    )
    def get_queryset(self):
        """
        이 View에서 사용할 기본 데이터셋을 정의합니다.
        Seat 모델 전체에서, 예약한 사람(reserved_by)이
        현재 요청을 보낸 사용자(self.request.user)인 경우만 필터링합니다.
        """
        user = self.request.user
        assert isinstance(user, User)
        return Seat.objects.filter(reserved_by=user).order_by("seat_number")
