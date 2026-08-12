from __future__ import annotations

import logging
from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string

logger = logging.getLogger(__name__)


@shared_task(name="notifications.tasks.send_notification_email_task", max_retries=3, default_retry_delay=60)
def send_notification_email_task(
    to_email: str,
    title: str,
    body: str,
    template_name: str | None = None,
    context: dict | None = None,
) -> bool:
    """
    Celery task to send notification emails asynchronously.
    """
    if not to_email:
        return False

    html_message = None
    if template_name:
        html_message = render_to_string(template_name, context or {})

    try:
        send_mail(
            subject=title,
            message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[to_email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as exc:
        logger.exception("Failed to send notification email to %s", to_email)
        raise exc
