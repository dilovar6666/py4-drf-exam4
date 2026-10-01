from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from medicines.models import Medicine, PharmacyMedicine
from pharmacies.models import Pharmacy, PharmacyWorker

from .models import Reservation


class ReservationFlowTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(username="reserve-user", password="pass12345")
        self.pharmacist = User.objects.create_user(
            username="reserve-pharmacist", password="pass12345", role="pharmacist"
        )
        self.other_pharmacist = User.objects.create_user(
            username="reserve-other", password="pass12345", role="pharmacist"
        )
        self.pharmacy = Pharmacy.objects.create(
            name="Reserve Pharmacy", address="Dushanbe", latitude=38.57, longitude=68.78
        )
        self.other_pharmacy = Pharmacy.objects.create(
            name="Reserve Other", address="Dushanbe", latitude=38.58, longitude=68.79
        )
        PharmacyWorker.objects.create(user=self.pharmacist, pharmacy=self.pharmacy)
        PharmacyWorker.objects.create(user=self.other_pharmacist, pharmacy=self.other_pharmacy)
        medicine = Medicine.objects.create(name="Test Medicine", barcode="reserve-test")
        self.stock = PharmacyMedicine.objects.create(
            pharmacy=self.pharmacy, medicine=medicine, price=10, quantity=5
        )

    def create_reservation(self, quantity=2):
        self.client.force_authenticate(self.user)
        return self.client.post(
            "/api/reservations/", {"pharmacy_medicine": self.stock.id, "quantity": quantity}
        )

    def test_quantity_zero_is_rejected(self):
        self.assertEqual(self.create_reservation(0).status_code, 400)

    def test_quantity_above_stock_is_rejected(self):
        self.assertEqual(self.create_reservation(6).status_code, 400)

    def test_create_decreases_stock(self):
        self.assertEqual(self.create_reservation(2).status_code, 201)
        self.stock.refresh_from_db()
        self.assertEqual(self.stock.quantity, 3)

    def test_cancel_returns_stock_once(self):
        reservation_id = self.create_reservation(2).data["id"]
        self.client.force_authenticate(self.pharmacist)
        response = self.client.patch(
            f"/api/reservations/{reservation_id}/", {"status": "cancelled"}
        )
        self.assertEqual(response.status_code, 200)
        self.stock.refresh_from_db()
        self.assertEqual(self.stock.quantity, 5)
        second = self.client.patch(
            f"/api/reservations/{reservation_id}/", {"status": "cancelled"}
        )
        self.assertEqual(second.status_code, 200)
        self.stock.refresh_from_db()
        self.assertEqual(self.stock.quantity, 5)

    def test_user_cannot_change_status(self):
        reservation_id = self.create_reservation(1).data["id"]
        response = self.client.patch(
            f"/api/reservations/{reservation_id}/", {"status": "confirmed"}
        )
        self.assertEqual(response.status_code, 400)

    def test_pharmacist_can_change_status_only_for_own_pharmacy(self):
        reservation_id = self.create_reservation(1).data["id"]
        self.client.force_authenticate(self.pharmacist)
        allowed = self.client.patch(
            f"/api/reservations/{reservation_id}/", {"status": "confirmed"}
        )
        self.assertEqual(allowed.status_code, 200)
        self.client.force_authenticate(self.other_pharmacist)
        denied = self.client.patch(
            f"/api/reservations/{reservation_id}/", {"status": "ready"}
        )
        self.assertEqual(denied.status_code, 404)

