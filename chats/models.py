from django.conf import settings
from django.db import models

from medicines.models import Medicine
from pharmacies.models import Pharmacy


class Chat(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    pharmacy = models.ForeignKey(Pharmacy, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("user", "pharmacy"),
                name="unique_user_pharmacy_chat",
            )
        ]

    def __str__(self):
        return f"{self.user} - {self.pharmacy}"


class Message(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE)
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    text = models.TextField()
    medicine = models.ForeignKey(Medicine, on_delete=models.SET_NULL, null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.text


class ChatBlock(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name="blocks")
    blocker = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="chat_blocks_created",
    )
    blocked = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="chat_blocks_received",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("chat", "blocker", "blocked"),
                name="unique_chat_block_pair",
            )
        ]

    def __str__(self):
        return f"{self.blocker} blocked {self.blocked} in chat {self.chat_id}"
