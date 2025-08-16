from typing import Optional

from django.conf import settings
from django.contrib.auth.models import User
from django.db import models


# Create your models here.
class Seat(models.Model):
    seat_number: int = models.AutoField(primary_key=True)
    is_reserved: bool = models.BooleanField(default=False)

    reserved_by: Optional[User] = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="seats",
    )

    def __str__(self) -> str:
        return f"Seat {self.seat_number}"
