from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
from django.conf import settings


class GoogleLogin(SocialLoginView):
    """ Exchanges a Google OAuth2 authorization code (obtained client-side by
    React) for MedFinder's own JWT access/refresh tokens — same response
    shape as the regular /api/auth/login/ endpoint, so the frontend
    handles both the same way.

    Frontend flow this endpoint expects:
      1. React sends the user to Google's OAuth consent screen.
      2. Google redirects back to GOOGLE_OAUTH_CALLBACK_URL with a `code`
         query param.
      3. React POSTs {"code": code} to this endpoint.
      4. This view exchanges that code with Google server-side, creates/
         finds the User, and returns {access, refresh, user} exactly like
         a normal login.
    """
    adapter_class = GoogleOAuth2Adapter
    client_class = OAuth2Client
    callback_url = settings.GOOGLE_OAUTH_CALLBACK_URL

    