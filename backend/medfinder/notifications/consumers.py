import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from pharmacies.models import PharmacyStaff
from .models import Message, PharmacyConversation


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope["user"]
        if user.is_anonymous:
            await self.close()
            return
        self.group_name = f"notify_user_{user.id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def notify_message(self, event):
        await self.send(text_data=json.dumps({
            "title": event["title"],
            "body": event["body"],
            "target_url": event.get("target_url", ""),
        }))


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope["user"]
        if user.is_anonymous:
            await self.close()
            return

        self.conversation_id = self.scope["url_route"]["kwargs"]["conversation_id"]
        allowed = await self.user_can_access_conversation(user, self.conversation_id)
        if not allowed:
            await self.close()
            return

        self.group_name = f"chat_conversation_{self.conversation_id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_text = data["message"].strip()
        except (json.JSONDecodeError, KeyError, AttributeError):
            return

        if not message_text:
            return

        saved, recipients_data = await self.save_message_and_get_recipients(
            self.scope["user"], self.conversation_id, message_text
        )

        # 1. Broadcast chat message to the active conversation room
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "chat_message",
                "id": saved["id"],
                "message": saved["content"],
                "sender_id": saved["sender_id"],
                "sent_on": saved["sent_on"],
            },
        )

        # 2. Dispatch real-time WebSocket toast notifications to conversation participants
        for rec in recipients_data:
            recipient_user = rec["user"]
            await self.channel_layer.group_send(
                f"notify_user_{recipient_user.id}",
                {
                    "type": "notify_message",
                    "title": rec["title"],
                    "body": rec["body"],
                    "target_url": f"/conversations/{self.conversation_id}",
                },
            )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "id": event["id"],
            "message": event["message"],
            "sender_id": event["sender_id"],
            "sent_on": event["sent_on"],
        }))

    @database_sync_to_async
    def user_can_access_conversation(self, user, conversation_id):
        try:
            conversation = PharmacyConversation.objects.select_related("pharmacy").get(id=conversation_id)
        except PharmacyConversation.DoesNotExist:
            return False

        if conversation.patient_id == user.id:
            return True
        if conversation.pharmacy.owner_id == user.id:
            return True
        return PharmacyStaff.objects.filter(
            pharmacy=conversation.pharmacy,
            pharmacist=user,
            status=PharmacyStaff.Status.APPROVED,
        ).exists()

    @database_sync_to_async
    def save_message_and_get_recipients(self, user, conversation_id, text):
        conversation = PharmacyConversation.objects.select_related(
            "pharmacy", "pharmacy__owner", "patient"
        ).get(id=conversation_id)

        msg = Message.objects.create(conversation=conversation, user=user, content=text)

        recipients_data = []
        if user.id == conversation.patient_id:
            # Patient sent message -> notify pharmacy owner and approved staff
            pharmacy = conversation.pharmacy
            if pharmacy.owner and pharmacy.owner.is_active and pharmacy.owner.id != user.id:
                recipients_data.append({
                    "user": pharmacy.owner,
                    "title": f"New message from {user.username or user.email}",
                    "body": text[:120],
                })

            staff_members = PharmacyStaff.objects.filter(
                pharmacy=pharmacy,
                status=PharmacyStaff.Status.APPROVED,
            ).select_related("pharmacist")

            existing_ids = {r["user"].id for r in recipients_data}
            for staff in staff_members:
                if staff.pharmacist.is_active and staff.pharmacist_id not in existing_ids and staff.pharmacist_id != user.id:
                    recipients_data.append({
                        "user": staff.pharmacist,
                        "title": f"New message from {user.username or user.email}",
                        "body": text[:120],
                    })
                    existing_ids.add(staff.pharmacist_id)
        else:
            # Pharmacy staff/owner sent message -> notify patient
            patient = conversation.patient
            if patient and patient.is_active and patient.id != user.id:
                recipients_data.append({
                    "user": patient,
                    "title": f"New message from {conversation.pharmacy.name}",
                    "body": text[:120],
                })

        return {
            "id": msg.id,
            "content": msg.content,
            "sender_id": user.id,
            "sent_on": msg.sent_on.isoformat(),
        }, recipients_data