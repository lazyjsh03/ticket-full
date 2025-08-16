# seats/permissions.py

from rest_framework import permissions


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    객체의 소유자 또는 관리자에게만 수정을 허용하는 커스텀 권한
    """

    def has_object_permission(self, request, view, obj):
        # obj는 확인할 대상 객체 (여기서는 Seat 인스턴스)

        # 관리자(is_staff)는 항상 모든 권한을 가집니다.
        if request.user.is_staff:
            return True

        # 객체의 소유자(reserved_by)와 요청을 보낸 사용자(request.user)가 같은지 확인합니다.
        return obj.reserved_by == request.user
