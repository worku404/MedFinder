import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { StatusBanner } from "../components/StatusBanner";
import { StampMark } from "../components/StampMark";
import { accountsApi } from "../api";

export function CheckEmailPage() {
  const location = useLocation();
  const email = location.state?.email;
  // "idle" | "sending" | "sent" | "error"
  const [status, setStatus] = useState("idle");

  const resend = async () => {
    if (!email) return;
    setStatus("sending");
    try {
      await accountsApi.resendVerification(email);
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <AuthLayout
      eyebrow="One more step"
      title="Confirm your email"
      subtitle={email ? `We sent a verification link to ${email}.` : "We sent a verification link to your inbox."}
      panelNote="Verified accounts keep the whole directory trustworthy — for every customer searching it."
    >
      <div className="check-email__mark">
        <StampMark state="settled" size={64} />
      </div>
      {status === "sent" && <StatusBanner tone="info">Email resent — check your inbox.</StatusBanner>}
      {status === "error" && <StatusBanner tone="error">Couldn't resend right now. Try again shortly.</StatusBanner>}
      <p className="auth-fineprint">
        Didn't get it? Check spam, or{" "}
        <button className="link-button" type="button" onClick={resend} disabled={status === "sending" || !email}>
          {status === "sending" ? "sending…" : "resend the link"}
        </button>
        .
      </p>
      <p className="auth-switch">
        <Link to="/login">Back to sign in</Link>
      </p>
    </AuthLayout>
  );
}
