from django.contrib.auth import get_user_model
from django.test import TransactionTestCase
from channels.db import database_sync_to_async
from channels.testing import WebsocketCommunicator
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import AccessToken

from config.asgi import application
from notifications.realtime import push_notification


class NotificationPermissionTests(APITestCase):
    def test_user_cannot_create_system_notification(self):
        user = get_user_model().objects.create_user(
            username="notification-user", password="pass12345"
        )
        self.client.force_authenticate(user)
        response = self.client.post(
            "/api/notifications/",
            {"user": user.id, "title": "Fake", "message": "Fake system event"},
        )
        self.assertEqual(response.status_code, 403)


class NotificationWebSocketTests(TransactionTestCase):
    async def test_notification_is_delivered_realtime(self):
        user = await database_sync_to_async(get_user_model().objects.create_user)(
            username="notification-ws", password="pass12345"
        )
        token = str(AccessToken.for_user(user))
        socket = WebsocketCommunicator(
            application,
            f"/ws/notifications/?token={token}",
            headers=[(b"origin", b"http://localhost:5173"), (b"host", b"localhost")],
        )
        self.assertTrue((await socket.connect())[0])
        await database_sync_to_async(push_notification)(user, "Realtime", "Delivered")
        event = await socket.receive_json_from()
        self.assertEqual(event["notification"]["title"], "Realtime")
        await socket.disconnect()
