from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from django.db.models import Q

from .models import Notification, StockNotification


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


def notify_stock_available(stock):
    subscriptions = StockNotification.objects.filter(
        medicine=stock.medicine,
        is_active=True,
    ).filter(Q(pharmacy__isnull=True) | Q(pharmacy=stock.pharmacy)).select_related("user")
    for subscription in subscriptions:
        push_notification(
            subscription.user,
            "Лекарство снова в наличии",
            f"{stock.medicine.name} доступен в аптеке {stock.pharmacy.name}.",
        )
        subscription.is_active = False
        subscription.save(update_fields=("is_active",))
