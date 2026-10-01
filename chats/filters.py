from .models import Chat, Message


def get_user_chats(user):
    if user.is_staff:
        return Chat.objects.all()
    if user.role == "pharmacist":
        return Chat.objects.filter(pharmacy__pharmacyworker__user=user).distinct()
    return Chat.objects.filter(user=user)


def get_chat_messages(chat_id, user):
    return Message.objects.filter(
        chat_id=chat_id,
        chat__in=get_user_chats(user),
    ).order_by("created_at")


def can_access_chat(user, chat_id):
    return user.is_authenticated and get_user_chats(user).filter(pk=chat_id).exists()
