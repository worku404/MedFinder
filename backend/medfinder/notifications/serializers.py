from rest_framework import serializers

from .models import ConversationReadState, Message, PharmacyConversation


class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source="user.username", read_only=True)
    sender_email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Message
        fields = [
            "id",
            "conversation",
            "user",
            "sender_username",
            "sender_email",
            "content",
            "sent_on",
        ]
        read_only_fields = ["id", "user", "sent_on"]


class ConversationSerializer(serializers.ModelSerializer):
    pharmacy_name = serializers.CharField(source="pharmacy.name", read_only=True)
    patient_email = serializers.EmailField(source="patient.email", read_only=True)
    patient_username = serializers.CharField(source="patient.username", read_only=True)
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = PharmacyConversation
        fields = [
            "id",
            "pharmacy",
            "pharmacy_name",
            "patient",
            "patient_email",
            "patient_username",
            "created",
            "last_message",
        ]
        read_only_fields = ["id", "patient", "created"]

    def get_last_message(self, instance):
        msg = instance.messages.order_by("-sent_on").first()
        if msg:
            return {
                "id": msg.id,
                "content": msg.content,
                "sender_id": msg.user_id,
                "sent_on": msg.sent_on.isoformat(),
            }
        return None
