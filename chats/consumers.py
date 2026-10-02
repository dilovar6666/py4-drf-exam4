from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer

from accounts.presence import mark_offline, mark_online, mark_seen
from .filters import can_access_chat
from .models import Chat, ChatBlock, Message
from .realtime import broadcast_message, message_payload


class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.chat_id = self.scope["url_route"]["kwargs"]["chat_id"]
        user = self.scope["user"]
        if not user.is_authenticated or not await self.has_access(user):
            await self.close(code=4403)
            return
        self.group_name = f"chat_{self.chat_id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await database_sync_to_async(mark_online)(user)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
            await database_sync_to_async(mark_offline)(self.scope["user"])

    async def receive_json(self, content):
        if content.get("type") == "ping":
            await database_sync_to_async(mark_seen)(self.scope["user"])
            return
        text = str(content.get("text", "")).strip()
        if not text:
            return
        if await self.is_blocked():
            await self.send_json({"type": "error", "code": "chat_blocked", "message": "Отправка сообщений недоступна."})
            return
        message = await self.create_message(text, content.get("medicine"))
        await database_sync_to_async(broadcast_message)(message)

    async def chat_message(self, event):
        await self.send_json({"type": "message", "message": event["message"]})

    async def chat_block(self, event):
        await self.send_json({"type": "block", "blocked": event["blocked"]})

    @database_sync_to_async
    def has_access(self, user):
        return can_access_chat(user, self.chat_id)

    @database_sync_to_async
    def is_blocked(self):
        return ChatBlock.objects.filter(chat_id=self.chat_id).exists()

    @database_sync_to_async
    def create_message(self, text, medicine_id):
        message = Message.objects.create(
            chat_id=self.chat_id,
            sender=self.scope["user"],
            text=text,
            medicine_id=medicine_id or None,
        )
        message.chat = Chat.objects.select_related("user", "pharmacy").get(pk=self.chat_id)
        return message
