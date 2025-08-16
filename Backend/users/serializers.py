# users/serializers.py

from django.contrib.auth.models import User
from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # 회원가입 시 사용할 필드를 지정합니다.
        fields = ["username", "password"]
        extra_kwargs = {
            # password는 쓰기 전용으로 설정하여, 응답에 포함되지 않도록 합니다.
            "password": {"write_only": True}
        }

    def create(self, validated_data):
        """
        사용자를 생성하고, 비밀번호를 해싱하여 저장합니다.
        """
        # User.objects.create_user() 헬퍼 함수를 사용하여 사용자를 생성하고
        # 비밀번호를 안전하게 해싱합니다.
        user = User.objects.create_user(
            username=validated_data["username"], password=validated_data["password"]
        )
        return user
