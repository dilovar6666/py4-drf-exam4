from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    class Role(models.TextChoices):
        USER = "user", "User"
        PHARMACIST = "pharmacist", "Pharmacist"

    phone = models.CharField(max_length=20, blank=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.USER)
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username


class UserPresence(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name="presence")
    active_connections = models.PositiveIntegerField(default=0)
    last_seen = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user} online={self.active_connections > 0}"
