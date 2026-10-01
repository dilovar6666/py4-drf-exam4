from django.conf import settings
from django.db import models

from pharmacies.models import Pharmacy


class Review(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    pharmacy = models.ForeignKey(Pharmacy, on_delete=models.CASCADE)
    rating = models.PositiveSmallIntegerField()
    text = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("user", "pharmacy"),
                name="unique_user_pharmacy_review",
            )
        ]

    def __str__(self):
        return f"{self.pharmacy} - {self.rating}"
