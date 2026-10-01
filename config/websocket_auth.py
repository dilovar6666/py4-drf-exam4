from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.authentication import JWTAuthentication


@database_sync_to_async
def user_from_token(raw_token):
    if not raw_token:
        return AnonymousUser()
    try:
        authentication = JWTAuthentication()
        token = authentication.get_validated_token(raw_token)
        return authentication.get_user(token)
    except Exception:
        return AnonymousUser()


class JwtQueryAuthMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        query = parse_qs(scope.get("query_string", b"").decode())
        token = query.get("token", [None])[0]
        scope["user"] = await user_from_token(token)
        return await self.app(scope, receive, send)
