import os

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

django_asgi_app = get_asgi_application()

from chats.routing import websocket_urlpatterns as chat_websockets
from config.websocket_auth import JwtQueryAuthMiddleware
from notifications.routing import websocket_urlpatterns as notification_websockets


application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AllowedHostsOriginValidator(
        JwtQueryAuthMiddleware(
            URLRouter(chat_websockets + notification_websockets)
        )
    ),
})
