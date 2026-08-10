// Kicks off the Google OAuth2 consent flow described in the openapi.yaml
// comment for /api/auth/google/: redirect to Google, Google redirects
// back to GOOGLE_OAUTH_CALLBACK_URL with a `code` param, and
// GoogleCallbackPage exchanges that code with the backend.

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI;

export function startGoogleLogin() {
  if (!GOOGLE_CLIENT_ID) {
    // Fails loudly in dev rather than silently redirecting to a broken URL.
    // eslint-disable-next-line no-console
    console.error("VITE_GOOGLE_CLIENT_ID is not set — see .env.example");
    return;
  }
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    prompt: "select_account",
  });
  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}
