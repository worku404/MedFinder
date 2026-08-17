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
    unread_count = serializers.SerializerMethodField()

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
            "unread_count",
        ]
        read_only_fields = ["id", "patient", "created"]

    def get_last_message(self, instance):
        messages = instance.messages.all()
        if messages:
            msg = max(messages, key=lambda m: m.sent_on)
            return {
                "id": msg.id,
                "content": msg.content,
                "sender_id": msg.user_id,
                "sent_on": msg.sent_on.isoformat(),
            }
        return None

    def get_unread_count(self, instance):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return 0

        user = request.user
        is_patient = (instance.patient_id == user.id)

        all_messages = list(instance.messages.all())
        all_read_states = list(instance.read_states.all())

        if is_patient:
            # Patient sees messages sent by pharmacy staff newer than their last read ID
            patient_state = next((rs for rs in all_read_states if rs.user_id == user.id), None)
            last_read_id = patient_state.last_read_message_id if patient_state else 0
            return sum(1 for m in all_messages if m.id > last_read_id and m.user_id != instance.patient_id)
        else:
            # Shared Store Inbox: If the latest message was already answered by pharmacy staff, 0 unread
            if all_messages and all_messages[-1].user_id != instance.patient_id:
                return 0

            # Count unread patient messages newer than the highest read ID by ANY staff member
            staff_states = [rs for rs in all_read_states if rs.user_id != instance.patient_id]
            max_staff_read_id = max((rs.last_read_message_id for rs in staff_states), default=0)

            return sum(1 for m in all_messages if m.id > max_staff_read_id and m.user_id == instance.patient_id)
