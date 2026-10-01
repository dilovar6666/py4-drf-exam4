from django.contrib.auth import get_user_model
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

