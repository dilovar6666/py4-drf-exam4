from .models import Message


def get_chat_messages(chat_id):
    return Message.objects.filter(
        chat_id=chat_id
    ).order_by("created_at")
