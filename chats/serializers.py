from rest_framework import serializers

from .models import Chat, Message


class ChatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = "__all__"
        extra_kwargs = {"user": {"read_only": True}}


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = "__all__"
        extra_kwargs = {"sender": {"read_only": True}}
