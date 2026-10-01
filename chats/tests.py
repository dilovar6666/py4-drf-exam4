from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from pharmacies.models import Pharmacy, PharmacyWorker

from .models import Chat, Message


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

