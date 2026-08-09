from allauth.account.adapter import DefaultAccountAdapter
from django.conf import settings


class AccountAdapter(DefaultAccountAdapter):
    """
    By default, allauth builds email confirmation links pointing at its
    own server-rendered Django view. Since this project has no
    server-rendered pages at all (Integration Guide, Section 1), that
    link needs to point at a React route instead. The frontend page at
    that route reads the `key` from the URL and POSTs it to
    /api/auth/register/verify-email/ (dj-rest-auth's existing endpoint).
    """

    def get_email_confirmation_url(self, request, emailconfirmation):
        return f"{settings.FRONTEND_URL}/verify-email/{emailconfirmation.key}"
