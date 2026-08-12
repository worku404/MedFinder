from django.urls import path

from .views import (
    ConversationListView,
    ConversationMessagesView,
    MarkReadView,
    StartConversationView,
)

urlpatterns = [
    path("pharmacies/<int:pharmacy_id>/conversations/start/", StartConversationView.as_view()),
    path("conversations/", ConversationListView.as_view()),
    path("conversations/<int:conversation_id>/messages/", ConversationMessagesView.as_view()),
    path("conversations/<int:conversation_id>/read/", MarkReadView.as_view()),
]