from django.urls import path

from .views import (
    ChatBlockDetailView,
    ChatBlockListCreateView,
    ChatDetailView,
    ChatListCreateView,
    ChatMessagesView,
    MessageDetailView,
    MessageListCreateView,
)


urlpatterns = [
    path("chats/", ChatListCreateView.as_view()),
    path("chats/<int:pk>/", ChatDetailView.as_view()),
    path("chats/<int:chat_id>/messages/", ChatMessagesView.as_view()),
    path("messages/", MessageListCreateView.as_view()),
    path("messages/<int:pk>/", MessageDetailView.as_view()),
    path("chat-blocks/", ChatBlockListCreateView.as_view()),
    path("chat-blocks/<int:pk>/", ChatBlockDetailView.as_view()),
]
