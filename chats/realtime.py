from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from notifications.realtime import push_notification


def message_payload(message):
    return {
        "id": message.pk,
        "chat": message.chat_id,
        "sender": message.sender_id,
        "text": message.text,
        "medicine": message.medicine_id,
        "is_read": message.is_read,
        "created_at": message.created_at.isoformat(),
    }


def broadcast_message(message):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"chat_{message.chat_id}",
        {"type": "chat.message", "message": message_payload(message)},
    )
    chat = message.chat
    if message.sender_id == chat.user_id:
        recipients = [worker.user for worker in chat.pharmacy.pharmacyworker_set.select_related("user")]
        title = "Новое сообщение клиента"
    else:
        recipients = [chat.user]
        title = "Аптека ответила в чате"
    for recipient in recipients:
        if recipient.pk != message.sender_id:
            push_notification(recipient, title, message.text[:180])


def broadcast_block(chat_id, blocked):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"chat_{chat_id}",
        {"type": "chat.block", "blocked": blocked},
    )
