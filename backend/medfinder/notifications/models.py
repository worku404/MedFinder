from django.conf import settings
from django.db import models
from pharmacies.models import Pharmacy   


class PharmacyConversation(models.Model):
    pharmacy = models.ForeignKey(
        Pharmacy, on_delete=models.CASCADE, related_name="conversations"
    )
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="pharmacy_conversations"
    )
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["pharmacy", "patient"], name="uniq_conversation_pharmacy_patient"
            )
        ]

    def __str__(self):
        return f"{self.patient} <-> {self.pharmacy}"


class Message(models.Model):
    conversation = models.ForeignKey(
        PharmacyConversation, on_delete=models.CASCADE, related_name="messages"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="chat_messages"
    )
    content = models.TextField()
    sent_on = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["conversation", "id"]),
            models.Index(fields=["conversation", "sent_on"]),
        ]

    def __str__(self):
        return f"{self.user} in {self.conversation} at {self.sent_on}"


class ConversationReadState(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="chat_read_states"
    )
    conversation = models.ForeignKey(
        PharmacyConversation, on_delete=models.CASCADE, related_name="read_states"
    )
    last_read_message_id = models.BigIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "conversation"], name="uniq_chat_read_state_user_conversation"
            )
        ]

    def __str__(self):
        return f"{self.user_id}:{self.conversation_id} -> {self.last_read_message_id}"