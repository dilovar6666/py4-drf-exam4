from io import BytesIO

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core import mail
from django.test import override_settings
from django.utils import timezone
from datetime import timedelta
from unittest.mock import patch
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


class EmailVerificationTests(APITestCase):
    @patch("accounts.views.send_verification_email.delay")
    def test_register_creates_unverified_user_and_verification_code(self, send):
        response = self.client.post("/api/auth/register/", {
            "username": "verify-user",
            "email": "verify@example.com",
            "password": "pass12345",
        }, format="json")
        self.assertEqual(response.status_code, 201)
        user = get_user_model().objects.get(username="verify-user")
        self.assertFalse(user.is_email_verified)
        code = user.email_verification_codes.get()
        send.assert_called_once_with(user.id, code.code)

    @patch("accounts.views.send_verification_email.delay")
    def test_valid_code_verifies_and_reuse_is_rejected(self, send):
        self.client.post("/api/auth/register/", {
            "username": "verify-valid",
            "email": "valid@example.com",
            "password": "pass12345",
        }, format="json")
        code = get_user_model().objects.get(username="verify-valid").email_verification_codes.get().code
        first = self.client.post("/api/auth/verify-email/", {"email": "valid@example.com", "code": code}, format="json")
        second = self.client.post("/api/auth/verify-email/", {"email": "valid@example.com", "code": code}, format="json")
        self.assertEqual(first.status_code, 200)
        self.assertEqual(second.status_code, 400)

    def test_expired_code_is_rejected(self):
        user = get_user_model().objects.create_user(username="expired", email="expired@example.com", password="pass12345")
        from .models import EmailVerificationCode
        EmailVerificationCode.objects.create(user=user, code="123456", expires_at=timezone.now() - timedelta(minutes=1))
        response = self.client.post("/api/auth/verify-email/", {"email": user.email, "code": "123456"}, format="json")
        self.assertEqual(response.status_code, 400)

    @override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
    def test_verification_email_task_sends_plain_and_html_message(self):
        from .tasks import send_verification_email

        user = get_user_model().objects.create_user(
            username="mail-task", email="mail-task@example.com", password="pass12345"
        )
        self.assertEqual(send_verification_email.run(user.id, "123456"), 1)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("123456", mail.outbox[0].body)
        self.assertEqual(mail.outbox[0].alternatives[0][1], "text/html")
