# users/urls.py

from django.urls import path

from .views import LoginView, MyReservationsView, SignupView

urlpatterns = [
    path("signup/", SignupView.as_view(), name="signup"),
    path("login/", LoginView.as_view(), name="login"),
    path("me/reservations/", MyReservationsView.as_view(), name="my-reservations"),
]
