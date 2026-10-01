from rest_framework import serializers

from .models import Chat, Message


class ChatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = "__all__"
        extra_kwargs = {"user": {"read_only": True}}

    def validate_pharmacy(self, value):
        if self.instance and value != self.instance.pharmacy:
            raise serializers.ValidationError("Аптеку существующего чата нельзя изменить.")
        return value

    def create(self, validated_data):
        chat, _ = Chat.objects.get_or_create(**validated_data)
        return chat


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = "__all__"
        extra_kwargs = {"sender": {"read_only": True}}

    def validate_chat(self, value):
        if self.instance and value != self.instance.chat:
            raise serializers.ValidationError("Сообщение нельзя переносить в другой чат.")
        return value
