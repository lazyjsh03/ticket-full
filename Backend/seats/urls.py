# reservations/urls.py

from django.urls import path
from .views import SeatListView, ReserveSeatView

urlpatterns = [
    path("seats/", SeatListView.as_view(), name="seat-list"),
    path("seats/reserve/", ReserveSeatView.as_view(), name="seat-reserve"),
]
