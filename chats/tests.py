from django.contrib.auth import get_user_model
from django.test import TransactionTestCase
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import AccessToken
from channels.testing import WebsocketCommunicator

from config.asgi import application
from pharmacies.models import Pharmacy, PharmacyWorker

from .models import Chat, ChatBlock, Message


class ChatPermissionTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(username="chat-user", password="pass12345")
        self.other = User.objects.create_user(username="chat-other", password="pass12345")
        self.pharmacist = User.objects.create_user(
            username="chat-pharmacist", password="pass12345", role="pharmacist"
        )
        self.other_pharmacist = User.objects.create_user(
            username="other-pharmacist", password="pass12345", role="pharmacist"
        )
        self.pharmacy = Pharmacy.objects.create(
            name="Test Pharmacy", address="Dushanbe", latitude=38.57, longitude=68.78
        )
        self.other_pharmacy = Pharmacy.objects.create(
            name="Other Pharmacy", address="Dushanbe", latitude=38.58, longitude=68.79
        )
        PharmacyWorker.objects.create(user=self.pharmacist, pharmacy=self.pharmacy)
        PharmacyWorker.objects.create(user=self.other_pharmacist, pharmacy=self.other_pharmacy)
        self.chat = Chat.objects.create(user=self.user, pharmacy=self.pharmacy)
        self.other_chat = Chat.objects.create(user=self.other, pharmacy=self.other_pharmacy)
        self.message = Message.objects.create(
            chat=self.chat, sender=self.user, text="Здравствуйте"
        )

    def test_user_cannot_read_another_chat(self):
        self.client.force_authenticate(self.user)
        response = self.client.get(f"/api/chats/{self.other_chat.id}/")
        self.assertEqual(response.status_code, 404)

    def test_user_cannot_send_to_another_chat(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(
            "/api/messages/", {"chat": self.other_chat.id, "text": "Чужой чат"}
        )
        self.assertEqual(response.status_code, 403)

    def test_user_cannot_move_message_to_another_chat(self):
        self.client.force_authenticate(self.user)
        response = self.client.patch(
            f"/api/messages/{self.message.id}/", {"chat": self.other_chat.id}
        )
        self.assertEqual(response.status_code, 400)
        self.message.refresh_from_db()
        self.assertEqual(self.message.chat, self.chat)

    def test_pharmacist_sees_only_own_pharmacy_chat(self):
        self.client.force_authenticate(self.pharmacist)
        response = self.client.get("/api/chats/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual([item["id"] for item in response.data], [self.chat.id])

    def test_pharmacist_can_reply_to_own_pharmacy_chat(self):
        self.client.force_authenticate(self.pharmacist)
        response = self.client.post(
            "/api/messages/", {"chat": self.chat.id, "text": "Есть в наличии"}
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["sender"], self.pharmacist.id)

    def test_blocked_chat_rejects_new_message(self):
        ChatBlock.objects.create(chat=self.chat, blocker=self.user, blocked=self.pharmacist)
        self.client.force_authenticate(self.pharmacist)
        response = self.client.post(
            "/api/messages/", {"chat": self.chat.id, "text": "Blocked"}
        )
        self.assertEqual(response.status_code, 403)

    def test_participant_can_block_and_unblock(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(
            "/api/chat-blocks/", {"chat": self.chat.id, "blocked": self.pharmacist.id}
        )
        self.assertEqual(response.status_code, 201)
        delete = self.client.delete(f"/api/chat-blocks/{response.data['id']}/")
        self.assertEqual(delete.status_code, 204)

    def test_admin_can_block_and_unblock_chat_participant(self):
        admin = get_user_model().objects.create_superuser(
            username="chat-admin", password="pass12345"
        )
        self.client.force_authenticate(admin)
        response = self.client.post(
            "/api/chat-blocks/", {"chat": self.chat.id, "blocked": self.user.id}
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["blocker"], admin.id)
        delete = self.client.delete(f"/api/chat-blocks/{response.data['id']}/")
        self.assertEqual(delete.status_code, 204)


class ChatWebSocketTests(TransactionTestCase):
    reset_sequences = True

    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(username="ws-user", password="pass12345")
        self.other = User.objects.create_user(username="ws-other", password="pass12345")
        self.pharmacist = User.objects.create_user(
            username="ws-pharmacist", password="pass12345", role="pharmacist"
        )
        self.pharmacy = Pharmacy.objects.create(
            name="WS Pharmacy", address="Dushanbe", latitude=38.57, longitude=68.78
        )
        PharmacyWorker.objects.create(user=self.pharmacist, pharmacy=self.pharmacy)
        self.chat = Chat.objects.create(user=self.user, pharmacy=self.pharmacy)

    def socket(self, user, chat=None):
        chat = chat or self.chat
        token = str(AccessToken.for_user(user))
        return WebsocketCommunicator(
            application,
            f"/ws/chats/{chat.id}/?token={token}",
            headers=[(b"origin", b"http://localhost:5173"), (b"host", b"localhost")],
        )

    async def test_authorized_participants_receive_message(self):
        sender = self.socket(self.user)
        receiver = self.socket(self.pharmacist)
        self.assertTrue((await sender.connect())[0])
        self.assertTrue((await receiver.connect())[0])
        await sender.send_json_to({"text": "Realtime hello"})
        sent = await sender.receive_json_from()
        received = await receiver.receive_json_from()
        self.assertEqual(sent["message"]["text"], "Realtime hello")
        self.assertEqual(received["message"]["text"], "Realtime hello")
        await sender.disconnect()
        await receiver.disconnect()

    async def test_unauthorized_user_cannot_connect(self):
        communicator = self.socket(self.other)
        connected, close_code = await communicator.connect()
        self.assertFalse(connected)
        self.assertEqual(close_code, 4403)
