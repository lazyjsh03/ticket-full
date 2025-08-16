# reservations/views.py

import random

from django.db import transaction
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from rest_framework import generics, status
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Seat
from .permissions import IsOwnerOrAdmin
from .serializers import ReservationSerializer, SeatSerializer


# 1. 좌석 목록 조회 API
class SeatListView(generics.ListAPIView):
    """
    모든 좌석의 목록과 예약 상태를 반환합니다.
    """

    queryset = Seat.objects.all().order_by("seat_number")
    serializer_class = SeatSerializer


# 2. 좌석 예약 요청 API
class ReserveSeatView(APIView):
    """
    특정 좌석을 예약합니다.
    - 99% 확률로 성공, 1% 확률로 실패합니다.
    """

    permission_classes = [IsAuthenticated]  # 인증된 사용자만 예약 가능

    @extend_schema(request=ReservationSerializer)
    def post(self, request, *args, **kwargs):
        serializer = ReservationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        seat_number = serializer.validated_data["seat_number"]

        try:
            # 트랜잭션 시작: 블록 내의 모든 DB 작업이 하나의 단위로 처리됨
            with transaction.atomic():
                seat = Seat.objects.get(seat_number=seat_number)

                if seat.is_reserved:
                    return Response(
                        {"error": "이미 예약된 좌석입니다."},
                        status=status.HTTP_409_CONFLICT,  # 409 Conflict: 리소스의 현재 상태와 충돌
                    )

                # 1% 확률로 의도적 실패 처리
                if random.random() < 0.01:
                    return Response(
                        {
                            "error": "서버 오류로 예약에 실패했습니다. 다시 시도해주세요."
                        },
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    )

                # 예약 성공 처리
                seat.is_reserved = True
                seat.reserved_by = request.user
                seat.save()

                return Response(
                    {
                        "message": f"좌석 {seat.seat_number}번이 성공적으로 예약되었습니다."
                    },
                    status=status.HTTP_200_OK,
                )

        except Seat.DoesNotExist:
            return Response(
                {"error": "존재하지 않는 좌석입니다."}, status=status.HTTP_404_NOT_FOUND
            )


class SeatResetView(APIView):
    """
    모든 좌석의 예약 상태를 초기화합니다. (관리자 전용)
    """

    # 이 API는 관리자 권한을 가진 유저만 접근할 수 있습니다.
    permission_classes = [IsAdminUser]

    @extend_schema(
        summary="Reset All Seats",
        description="모든 좌석의 'is_reserved' 상태를 false, 'reserved_by'를 null로 초기화.",
    )
    def post(self, request, *args, **kwargs):
        """
        모든 좌석의 예약 상태를 초기화합니다.
        """
        # .update()는 여러 객체를 한 번의 쿼리로 효율적으로 업데이트합니다.
        updated_count = Seat.objects.all().update(is_reserved=False, reserved_by=None)

        return Response(
            {"message": f"성공적으로 {updated_count}개의 좌석을 초기화했습니다."},
            status=status.HTTP_200_OK,
        )


class SeatCancelView(APIView):
    """
    특정 좌석의 예약을 취소합니다.
    - 예약한 사용자 본인 또는 관리자만 취소할 수 있습니다.
    """

    # 기본적으로 인증된 사용자여야 하며, 추가적으로 IsOwnerOrAdmin 권한을 통과해야 합니다.
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]

    @extend_schema(
        summary="Cancel a Reservation",
        description="특정 좌석의 예약을 취소합니다. 예약자 본인 또는 관리자만 가능합니다.",
    )
    def delete(self, request, seat_number, *args, **kwargs):
        """
        URL로 전달받은 seat_number의 좌석 예약을 취소합니다.
        """
        # 1. 좌석 번호로 객체를 찾습니다. 없으면 404 에러를 반환합니다.
        seat = get_object_or_404(Seat, seat_number=seat_number)

        # 2. DRF가 이 객체(seat)를 IsOwnerOrAdmin 권한 클래스에 전달하여 자동으로 권한을 확인합니다.
        #    권한이 없으면 여기서 403 Forbidden 에러가 발생하며 코드가 중단됩니다.
        self.check_object_permissions(request, seat)

        # 3. 이미 예약이 취소된 상태인지 확인합니다.
        if not seat.is_reserved:
            return Response(
                {"error": "해당 좌석은 예약 상태가 아닙니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 4. 예약 취소 처리
        seat.is_reserved = False
        seat.reserved_by = None
        seat.save()

        return Response(
            {
                "message": f"좌석 {seat.seat_number}번의 예약이 성공적으로 취소되었습니다."
            },
            status=status.HTTP_200_OK,
        )
