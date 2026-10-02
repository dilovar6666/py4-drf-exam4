from channels.generic.websocket import AsyncJsonWebsocketConsumer

from accounts.presence import mark_offline, mark_online, mark_seen
from channels.db import database_sync_to_async


class NotificationConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        user = self.scope["user"]
        if not user.is_authenticated:
            await self.close(code=4401)
            return
        self.group_name = f"notifications_{user.pk}"
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

    async def notification_created(self, event):
        await self.send_json({"type": "notification", "notification": event["notification"]})
