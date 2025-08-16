from django.db import models
from django.conf import settings


# Create your models here.
class Seat(models.Model):
    seat_number = models.AutoField(primary_key=True)
    is_reserved = models.BooleanField(default=False)

    reserved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reserved_seats",
    )

    def __str__(self):
        return f"Seat {self.seat_number}"
