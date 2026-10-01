from django.db.models import Q
from rest_framework import generics
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from notifications.realtime import push_notification

from .filters import get_chat_messages, get_user_chats
from .models import Chat, ChatBlock, Message
from .realtime import broadcast_block, broadcast_message
from .serializers import ChatBlockSerializer, ChatSerializer, MessageSerializer


class ChatListCreateView(generics.ListCreateAPIView):
    serializer_class = ChatSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return get_user_chats(self.request.user)

    def perform_create(self, serializer):
        if self.request.user.role == "pharmacist" and not self.request.user.is_staff:
            raise PermissionDenied("Pharmacists reply to existing pharmacy chats.")
        chat = serializer.save(user=self.request.user)
        if getattr(chat, "_was_created", False):
            for worker in chat.pharmacy.pharmacyworker_set.select_related("user"):
                push_notification(worker.user, "Новый чат", f"Клиент открыл чат с аптекой {chat.pharmacy.name}.")


class ChatDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ChatSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return get_user_chats(self.request.user)


class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Message.objects.filter(chat__in=get_user_chats(self.request.user))

    def perform_create(self, serializer):
        if not get_user_chats(self.request.user).filter(
            pk=serializer.validated_data["chat"].pk
        ).exists():
            raise PermissionDenied("You cannot send messages to this chat.")
        chat = serializer.validated_data["chat"]
        if chat.blocks.exists():
            raise PermissionDenied("Отправка сообщений недоступна: чат заблокирован.")
        message = serializer.save(sender=self.request.user)
        broadcast_message(message)


class MessageDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Message.objects.filter(chat__in=get_user_chats(self.request.user))


class ChatMessagesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, chat_id):
        messages = get_chat_messages(chat_id, request.user)
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)


class ChatBlockListCreateView(generics.ListCreateAPIView):
    serializer_class = ChatBlockSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = ChatBlock.objects.select_related("chat", "blocker", "blocked")
        chat_id = self.request.query_params.get("chat")
        if chat_id:
            queryset = queryset.filter(chat_id=chat_id)
        if self.request.user.is_staff:
            return queryset
        return queryset.filter(chat__in=get_user_chats(self.request.user)).filter(
            Q(blocker=self.request.user) | Q(blocked=self.request.user)
        )

    def perform_create(self, serializer):
        chat = serializer.validated_data["chat"]
        blocked = serializer.validated_data["blocked"]
        user = self.request.user
        if not get_user_chats(user).filter(pk=chat.pk).exists():
            raise PermissionDenied("Нет доступа к этому чату.")
        participant_ids = {chat.user_id}
        participant_ids.update(chat.pharmacy.pharmacyworker_set.values_list("user_id", flat=True))
        if blocked.pk not in participant_ids or blocked.pk == user.pk:
            raise PermissionDenied("Можно заблокировать только другого участника этого чата.")
        serializer.save(blocker=user)
        broadcast_block(chat.pk, True)


class ChatBlockDetailView(generics.DestroyAPIView):
    serializer_class = ChatBlockSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return ChatBlock.objects.all()
        return ChatBlock.objects.filter(blocker=self.request.user)

    def perform_destroy(self, instance):
        chat_id = instance.chat_id
        instance.delete()
        broadcast_block(chat_id, ChatBlock.objects.filter(chat_id=chat_id).exists())
