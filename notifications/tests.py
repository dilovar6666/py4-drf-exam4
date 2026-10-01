from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase


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

