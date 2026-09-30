from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView

from .filters import get_chat_messages
from .models import Chat, Message
from .serializers import ChatSerializer, MessageSerializer


class ChatListCreateView(generics.ListCreateAPIView):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer


class ChatDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer


class MessageListCreateView(generics.ListCreateAPIView):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer


class MessageDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer


class ChatMessagesView(APIView):
    def get(self, request, chat_id):
        messages = get_chat_messages(chat_id)
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)
