from django.urls import path

from .views import (
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
]
