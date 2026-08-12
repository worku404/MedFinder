import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { StatusBanner } from "../../../components/StatusBanner";
import { useAuth } from "../../../context/AuthContext";

export function GoogleCallbackPage() {
  const [searchParams] = useSearchParams();
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const code = searchParams.get("code");
    const oauthError = searchParams.get("error");

    if (oauthError) {
      setError("Google sign-in was cancelled.");
      return;
    }
    if (!code) {
      setError("Missing authorization code.");
      return;
    }

    loginWithGoogle(code)
      .then(() => navigate("/account", { replace: true }))
      .catch(() => setError("Couldn't complete Google sign-in. Try again."));
  }, [searchParams, loginWithGoogle, navigate]);

  return (
    <AuthLayout
      eyebrow="Google sign-in"
      title={error ? "Sign-in failed" : "Finishing sign-in…"}
      panelNote="Almost there."
    >
      {error ? (
        <>
          <StatusBanner tone="error">{error}</StatusBanner>
          <Link className="btn btn--primary" to="/login">
            Back to sign in
          </Link>
        </>
      ) : (
        <p className="auth-fineprint">Confirming with Google, one moment.</p>
      )}
    </AuthLayout>
  );
}
