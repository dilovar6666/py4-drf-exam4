from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from .models import Notification


def push_notification(user, title, message):
    notification = Notification.objects.create(user=user, title=title, message=message)
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"notifications_{user.pk}",
        {
            "type": "notification.created",
            "notification": {
                "id": notification.pk,
                "user": user.pk,
                "title": notification.title,
                "message": notification.message,
                "is_read": False,
                "created_at": notification.created_at.isoformat(),
            },
        },
    )
    return notification
