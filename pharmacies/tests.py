from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from .models import Pharmacy, PharmacyApplication, PharmacyWorker


class PharmacyApplicationTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(username="applicant", password="pass12345")
        self.other = User.objects.create_user(username="other-applicant", password="pass12345")
        self.admin = User.objects.create_superuser(username="application-admin", password="pass12345")
        self.payload = {
            "name": "Application Pharmacy",
            "address": "Dushanbe, Test street 1",
            "latitude": "38.573000",
            "longitude": "68.786000",
            "phone": "+992900000000",
            "opening_time": "08:00:00",
            "closing_time": "22:00:00",
            "is_24_hours": False,
            "description": "Application test",
        }

    def create_application(self):
        self.client.force_authenticate(self.user)
        return self.client.post("/api/pharmacy-applications/", self.payload)

    def test_user_creates_application_and_sees_own_status(self):
        response = self.create_application()
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["status"], "pending")
        self.client.force_authenticate(self.other)
        self.assertEqual(self.client.get("/api/pharmacy-applications/").data, [])

    def test_admin_approve_creates_pharmacy_once_and_links_applicant(self):
        application_id = self.create_application().data["id"]
        self.client.force_authenticate(self.admin)
        first = self.client.post(f"/api/pharmacy-applications/{application_id}/approve/")
        second = self.client.post(f"/api/pharmacy-applications/{application_id}/approve/")
        self.assertEqual(first.status_code, 200)
        self.assertEqual(second.status_code, 200)
        self.assertEqual(Pharmacy.objects.filter(name=self.payload["name"]).count(), 1)
        application = PharmacyApplication.objects.get(pk=application_id)
        self.assertTrue(PharmacyWorker.objects.filter(user=self.user, pharmacy=application.pharmacy).exists())
        self.user.refresh_from_db()
        self.assertEqual(self.user.role, "pharmacist")

    def test_admin_rejects_pending_application(self):
        application_id = self.create_application().data["id"]
        self.client.force_authenticate(self.admin)
        response = self.client.post(f"/api/pharmacy-applications/{application_id}/reject/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "rejected")
        self.assertFalse(Pharmacy.objects.filter(name=self.payload["name"]).exists())
