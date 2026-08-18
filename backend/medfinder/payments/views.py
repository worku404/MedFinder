import hashlib
import hmac
import json
import uuid

from django.conf import settings
from rest_framework import status
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from . import chapa
from .models import Payment
from .serializers import InitiatePaymentSerializer, PaymentSerializer
from .tasks import process_payment_webhook


class InitiatePaymentView(APIView):
    """
    POST /api/payments/initiate/

    API-first (JSON): creates a PENDING Payment and returns Chapa's hosted
    `checkout_url` for the React SPA to redirect the patient to. Funds are
    split to the pharmacy's Chapa subaccount automatically (Model A).
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = InitiatePaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        inv = serializer.validated_data["inventory"]
        qty = serializer.validated_data["quantity"]
        pharmacy = inv.pharmacy
        payout = pharmacy.payout_account

        amount = inv.price * qty
        tx_ref = str(uuid.uuid4())

        try:
            data = chapa.initialize_transaction(
                amount=amount,
                email=request.user.email,
                first_name=request.user.first_name,
                last_name=request.user.last_name,
                tx_ref=tx_ref,
                subaccount_id=payout.chapa_subaccount_id,
                commission_percent=payout.commission_percent,
            )
        except Exception:
            return Response(
                {"detail": "Unable to reach the payment gateway. Please try again."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        Payment.objects.create(
            patient=request.user,
            pharmacy=pharmacy,
            inventory=inv,
            quantity=qty,
            amount=amount,
            tx_ref=tx_ref,
            status=Payment.Status.PENDING,
        )

        checkout_url = (data.get("data") or {}).get("checkout_url")
        return Response(
            {"tx_ref": tx_ref, "checkout_url": checkout_url},
            status=status.HTTP_201_CREATED,
        )


class ChapaWebhookView(APIView):
    """
    POST /api/payments/webhook/

    Verifies the Chapa HMAC signature, then hands the event to Celery. Returns
    fast; all state changes happen asynchronously (and are re-verified server-
    side in the task).
    """

    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        signature = (
            request.headers.get("x-chapa-signature")
            or request.headers.get("chapa-signature")
        )
        if not signature or not settings.CHAPA_WEBHOOK_SECRET:
            return Response(status=status.HTTP_403_FORBIDDEN)

        expected = hmac.new(
            settings.CHAPA_WEBHOOK_SECRET.encode(),
            request.body,
            hashlib.sha256,
        ).hexdigest()
        if not hmac.compare_digest(expected, signature):
            return Response(status=status.HTTP_403_FORBIDDEN)

        try:
            event = json.loads(request.body)
        except json.JSONDecodeError:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        process_payment_webhook.delay(event)
        return Response(status=status.HTTP_200_OK)


class PaymentDetailView(RetrieveAPIView):
    """
    GET /api/payments/<tx_ref>/

    Read-only status lookup used by the SPA return page to poll for the final
    result. Scoped to the requesting patient.
    """

    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "tx_ref"

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False) or not self.request.user.is_authenticated:
            return Payment.objects.none()
        return Payment.objects.select_related(
            "pharmacy", "inventory", "inventory__medicine"
        ).filter(patient=self.request.user)
