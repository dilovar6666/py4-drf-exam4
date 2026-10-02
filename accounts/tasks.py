from celery import shared_task
from django.conf import settings
from django.core.mail import EmailMultiAlternatives


@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=True, max_retries=2)
def send_verification_email(self, user_id, code):
    from .models import CustomUser

    user = CustomUser.objects.get(pk=user_id)
    subject = "PharmaMap - email verification"
    text = (
        f"Hello, {user.username}!\n\n"
        f"Your PharmaMap email verification code is: {code}\n"
        "This code expires in 10 minutes. Do not share it with anyone."
    )
    html = (
        "<div style='font-family:Arial,sans-serif;line-height:1.5'>"
        f"<h2>PharmaMap</h2><p>Hello, {user.username}!</p>"
        f"<p>Your verification code: <strong style='font-size:24px;letter-spacing:4px'>{code}</strong></p>"
        "<p>This code expires in 10 minutes. Do not share it with anyone.</p></div>"
    )
    message = EmailMultiAlternatives(subject, text, settings.DEFAULT_FROM_EMAIL, [user.email])
    message.attach_alternative(html, "text/html")
    return message.send(fail_silently=False)
