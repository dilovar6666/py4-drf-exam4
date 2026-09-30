from .models import Message


def get_chat_messages(chat_id, user):
    return Message.objects.filter(
        chat_id=chat_id,
        chat__user=user,
    ).order_by("created_at")
