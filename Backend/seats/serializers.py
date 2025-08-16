# reservations/serializers.py

from rest_framework import serializers
from .models import Seat


class SeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seat
        fields = ["seat_number", "is_reserved"]


class ReservationSerializer(serializers.Serializer):
    seat_number = serializers.IntegerField()
    # 추후 예약자 이름, 연락처 등 필드 추가 가능
    # name = serializers.CharField(max_length=100)
    # phone_number = serializers.CharField(max_length=20)
