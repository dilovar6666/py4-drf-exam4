from rest_framework import generics
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .filters import get_chat_messages, get_user_chats
from .models import Chat, Message
from .serializers import ChatSerializer, MessageSerializer


class ChatListCreateView(generics.ListCreateAPIView):
    serializer_class = ChatSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return get_user_chats(self.request.user)

    def perform_create(self, serializer):
        if self.request.user.role == "pharmacist" and not self.request.user.is_staff:
            raise PermissionDenied("Pharmacists reply to existing pharmacy chats.")
        serializer.save(user=self.request.user)


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
        serializer.save(sender=self.request.user)


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
