from .models import Review


def get_pharmacy_reviews(pharmacy_id):
    return Review.objects.filter(
        pharmacy_id=pharmacy_id
    ).order_by("-created_at")
