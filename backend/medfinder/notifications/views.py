from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import status as http_status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from pharmacies.models import Pharmacy, PharmacyStaff
from .models import ConversationReadState, Message, PharmacyConversation
from .serializers import ConversationSerializer, MessageSerializer


class StartConversationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pharmacy_id):
        pharmacy = get_object_or_404(Pharmacy, id=pharmacy_id, status=Pharmacy.Status.VERIFIED)

        # Staff cannot start a conversation with their own pharmacy
        is_owner = pharmacy.owner_id == request.user.id
        is_staff = PharmacyStaff.objects.filter(
            pharmacy=pharmacy, pharmacist=request.user, status=PharmacyStaff.Status.APPROVED
        ).exists()
        if is_owner or is_staff:
            return Response(
                {"detail": "Pharmacy staff cannot start a conversation with their own pharmacy."},
                status=http_status.HTTP_400_BAD_REQUEST,
            )

        conversation, created = PharmacyConversation.objects.get_or_create(
            pharmacy=pharmacy, patient=request.user
        )
        serializer = ConversationSerializer(conversation)
        return Response(
            serializer.data,
            status=http_status.HTTP_201_CREATED if created else http_status.HTTP_200_OK,
        )


class ConversationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        # Patient sees conversations they initiated; Pharmacist sees conversations for their stores
        conversations = PharmacyConversation.objects.filter(
            Q(patient=user) |
            Q(pharmacy__owner=user) |
            Q(
                pharmacy__staff_memberships__pharmacist=user,
                pharmacy__staff_memberships__status=PharmacyStaff.Status.APPROVED,
            )
        ).select_related("pharmacy", "patient").distinct().order_by("-created")

        serializer = ConversationSerializer(conversations, many=True)
        return Response(serializer.data)


class ConversationMessagesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, conversation_id):
        user = request.user
        conversation = get_object_or_404(
            PharmacyConversation.objects.select_related("pharmacy"),
            id=conversation_id,
        )

        # Access check: patient, pharmacy owner, or approved staff
        has_access = (
            conversation.patient_id == user.id or
            conversation.pharmacy.owner_id == user.id or
            PharmacyStaff.objects.filter(
                pharmacy=conversation.pharmacy,
                pharmacist=user,
                status=PharmacyStaff.Status.APPROVED,
            ).exists()
        )
        if not has_access:
            return Response(
                {"detail": "You do not have permission to view this conversation."},
                status=http_status.HTTP_403_FORBIDDEN,
            )

        messages = Message.objects.filter(conversation=conversation).select_related("user").order_by("sent_on")
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)


class MarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, conversation_id):
        user = request.user
        conversation = get_object_or_404(
            PharmacyConversation.objects.select_related("pharmacy"),
            id=conversation_id,
        )

        has_access = (
            conversation.patient_id == user.id or
            conversation.pharmacy.owner_id == user.id or
            PharmacyStaff.objects.filter(
                pharmacy=conversation.pharmacy,
                pharmacist=user,
                status=PharmacyStaff.Status.APPROVED,
            ).exists()
        )
        if not has_access:
            return Response(
                {"detail": "You do not have permission to access this conversation."},
                status=http_status.HTTP_403_FORBIDDEN,
            )

        last_message_id = request.data.get("last_read_message_id")
        if last_message_id is None:
            return Response(
                {"detail": "last_read_message_id is required."},
                status=http_status.HTTP_400_BAD_REQUEST,
            )

        state, _ = ConversationReadState.objects.update_or_create(
            user=user,
            conversation=conversation,
            defaults={"last_read_message_id": last_message_id},
        )
        return Response({"last_read_message_id": state.last_read_message_id})