from django.urls import path

from .views import ChapaWebhookView, InitiatePaymentView, PaymentDetailView

urlpatterns = [
    path("initiate/", InitiatePaymentView.as_view(), name="payment-initiate"),
    path("webhook/", ChapaWebhookView.as_view(), name="payment-webhook"),
    path("<str:tx_ref>/", PaymentDetailView.as_view(), name="payment-detail"),
]
