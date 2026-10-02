from datetime import timedelta

from django.utils import timezone

from .models import UserPresence


PRESENCE_TIMEOUT_SECONDS = 70


def mark_online(user):
    presence, _ = UserPresence.objects.get_or_create(user=user)
    presence.active_connections += 1
    presence.save(update_fields=("active_connections", "last_seen"))


def mark_seen(user):
    UserPresence.objects.filter(user=user).update(last_seen=timezone.now())


def mark_offline(user):
    presence, _ = UserPresence.objects.get_or_create(user=user)
    presence.active_connections = max(0, presence.active_connections - 1)
    presence.save(update_fields=("active_connections", "last_seen"))


def presence_payload(user):
    if not user:
        return None
    presence = UserPresence.objects.filter(user=user).first()
    if not presence:
        return {"user": user.pk, "is_online": False, "last_seen": None}
    cutoff = timezone.now() - timedelta(seconds=PRESENCE_TIMEOUT_SECONDS)
    return {
        "user": user.pk,
        "is_online": presence.active_connections > 0 and presence.last_seen >= cutoff,
        "last_seen": presence.last_seen.isoformat(),
    }
