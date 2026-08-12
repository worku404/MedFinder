from __future__ import annotations

import logging
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from .tasks import send_notification_email_task

logger = logging.getLogger(__name__)


def notify(
    recipient,
    title: str,
    body: str,
    target_url: str = "",
    send_email: bool = False,
    email_template: str | None = None,
    email_context: dict | None = None,
) -> None:
    if not recipient or not recipient.is_authenticated:
        return

    # 1. Live WebSocket push for online users
    try:
        channel_layer = get_channel_layer()
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                f"notify_user_{recipient.id}",
                {
                    "type": "notify_message",
                    "title": title,
                    "body": body,
                    "target_url": target_url,
                },
            )
    except Exception:
        logger.exception("WebSocket push failed for user %s", recipient.id)

    # 2. Async email task via Celery
    if send_email and recipient.email:
        send_notification_email_task.delay(
            to_email=recipient.email,
            title=title,
            body=body,
            template_name=email_template,
            context=email_context,
        )