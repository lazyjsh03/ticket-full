# reservations/urls.py

from django.urls import path

from .views import ReserveSeatView, SeatCancelView, SeatListView, SeatResetView

urlpatterns = [
    path("seats/", SeatListView.as_view(), name="seat-list"),
    path("seats/reserve/", ReserveSeatView.as_view(), name="seat-reserve"),
    path("seats/reset/", SeatResetView.as_view(), name="seat-reset"),
    path("seats/<str:seat_number>/cancel/", SeatCancelView.as_view(), name="seat-cancel"),
]
