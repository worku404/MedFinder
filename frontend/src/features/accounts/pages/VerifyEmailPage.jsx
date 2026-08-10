import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { StatusBanner } from "../components/StatusBanner";
import { StampMark } from "../components/StampMark";
import { accountsApi } from "../api";

export function VerifyEmailPage() {
  const { key } = useParams();
  // "verifying" | "success" | "error"
  const [status, setStatus] = useState("verifying");

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        await accountsApi.verifyEmail(key);
        if (!cancelled) setStatus("success");
      } catch {
        if (!cancelled) setStatus("error");
      }
    }
    if (key) run();
    else setStatus("error");
    return () => {
      cancelled = true;
    };
  }, [key]);

  return (
    <AuthLayout
      eyebrow="Email verification"
      title={status === "success" ? "Email confirmed" : status === "error" ? "Link expired" : "Confirming…"}
      panelNote="One confirmed email, one trustworthy account."
    >
      {status === "verifying" && <p className="auth-fineprint">Hold on a moment.</p>}
      {status === "success" && (
        <>
          <div className="check-email__mark">
            <StampMark state="settled" size={64} />
          </div>
          <StatusBanner tone="info">Your email is confirmed. You can sign in now.</StatusBanner>
          <Link className="btn btn--primary" to="/login">
            Sign in
          </Link>
        </>
      )}
      {status === "error" && (
        <>
          <StatusBanner tone="error">This link is invalid or has expired.</StatusBanner>
          <Link className="btn btn--primary" to="/register/check-email">
            Request a new link
          </Link>
        </>
      )}
    </AuthLayout>
  );
}
