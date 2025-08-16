# reservations/views.py

import random
from django.db import transaction
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, OpenApiParameter

from .models import Seat
from .serializers import SeatSerializer, ReservationSerializer


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
    - 동시성 문제를 방지하기 위해 비관적 락(Pessimistic Lock)을 사용합니다.
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
                # select_for_update(): 해당 좌석 row에 Lock을 걸어 동시 접근을 막음
                seat = Seat.objects.select_for_update().get(seat_number=seat_number)

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
