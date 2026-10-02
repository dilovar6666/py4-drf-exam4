from rest_framework import serializers

from accounts.presence import presence_payload
from .models import Chat, ChatBlock, Message


class ChatSerializer(serializers.ModelSerializer):
    counterpart_id = serializers.SerializerMethodField()
    counterpart_presence = serializers.SerializerMethodField()
    is_blocked = serializers.SerializerMethodField()

    class Meta:
        model = Chat
        fields = "__all__"
        extra_kwargs = {"user": {"read_only": True}}

    def get_counterpart_id(self, obj):
        request = self.context.get("request")
        if request and request.user.role == "pharmacist" and not request.user.is_staff:
            return obj.user_id
        worker = obj.pharmacy.pharmacyworker_set.order_by("id").first()
        return worker.user_id if worker else None

    def get_is_blocked(self, obj):
        return obj.blocks.exists()

    def get_counterpart_presence(self, obj):
        request = self.context.get("request")
        if not request:
            return None
        if request.user.role == "pharmacist" and not request.user.is_staff:
            return presence_payload(obj.user)
        last_pharmacist_message = obj.message_set.exclude(sender=obj.user).select_related("sender").order_by("-created_at").first()
        return presence_payload(last_pharmacist_message.sender) if last_pharmacist_message else None

    def validate_pharmacy(self, value):
        if self.instance and value != self.instance.pharmacy:
            raise serializers.ValidationError("Аптеку существующего чата нельзя изменить.")
        return value

    def create(self, validated_data):
        chat, created = Chat.objects.get_or_create(**validated_data)
        chat._was_created = created
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


class ChatBlockSerializer(serializers.ModelSerializer):
    blocker_username = serializers.CharField(source="blocker.username", read_only=True)
    blocked_username = serializers.CharField(source="blocked.username", read_only=True)

    class Meta:
        model = ChatBlock
        fields = (
            "id", "chat", "blocker", "blocked", "created_at",
            "blocker_username", "blocked_username",
        )
        read_only_fields = ("blocker", "created_at")
