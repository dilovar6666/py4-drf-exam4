from io import BytesIO

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image
from rest_framework.test import APITestCase


class UserApiPermissionTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(username="account-user", password="pass12345")
        self.staff = User.objects.create_user(
            username="account-staff", password="pass12345", is_staff=True
        )

    def test_anonymous_users_endpoint_denied(self):
        self.assertEqual(self.client.get("/api/users/").status_code, 401)

    def test_regular_user_users_endpoint_denied(self):
        self.client.force_authenticate(self.user)
        self.assertEqual(self.client.get("/api/users/").status_code, 403)

    def test_staff_users_endpoint_allowed(self):
        self.client.force_authenticate(self.staff)
        self.assertEqual(self.client.get("/api/users/").status_code, 200)

    def test_user_can_upload_replace_and_remove_own_avatar(self):
        self.client.force_authenticate(self.user)
        image = Image.new("RGB", (2, 2), "teal")
        buffer = BytesIO(); image.save(buffer, format="PNG"); png = buffer.getvalue()
        first = SimpleUploadedFile("first.png", png, content_type="image/png")
        uploaded = self.client.patch("/api/auth/me/", {"avatar": first}, format="multipart")
        self.assertEqual(uploaded.status_code, 200)
        self.assertTrue(uploaded.data["avatar"].startswith("/media/avatars/"))
        second = SimpleUploadedFile("second.png", png, content_type="image/png")
        replaced = self.client.patch("/api/auth/me/", {"avatar": second}, format="multipart")
        self.assertEqual(replaced.status_code, 200)
        self.assertIn("second", replaced.data["avatar"])
        removed = self.client.patch("/api/auth/me/", {"avatar": None}, format="json")
        self.assertEqual(removed.status_code, 200)
        self.assertIsNone(removed.data["avatar"])

    def test_user_cannot_change_another_users_avatar(self):
        other = get_user_model().objects.create_user(username="other-avatar", password="pass12345")
        self.client.force_authenticate(self.user)
        image = Image.new("RGB", (2, 2), "teal")
        buffer = BytesIO(); image.save(buffer, format="PNG")
        avatar = SimpleUploadedFile("other.png", buffer.getvalue(), content_type="image/png")
        response = self.client.patch(f"/api/users/{other.id}/", {"avatar": avatar}, format="multipart")
        self.assertEqual(response.status_code, 403)
