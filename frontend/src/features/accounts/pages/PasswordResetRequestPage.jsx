import { useState } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { FormField } from "../components/FormField";
import { StatusBanner } from "../components/StatusBanner";
import { accountsApi } from "../api";
import { ApiError } from "../../../lib/apiClient";

export function PasswordResetRequestPage() {
  const [email, setEmail] = useState("");
  // "idle" | "sending" | "sent"
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      await accountsApi.passwordReset(email);
      setStatus("sent");
    } catch (err) {
      setStatus("idle");
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    }
  };

  if (status === "sent") {
    return (
      <AuthLayout
        eyebrow="Password reset"
        title="Check your email"
        subtitle={`We sent a reset link to ${email}.`}
        panelNote="The link expires after a short window, for your account's safety."
      >
        <p className="auth-switch">
          <Link to="/login">Back to sign in</Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="Password reset"
      title="Reset your password"
      subtitle="We'll email you a link to set a new one."
      panelNote="Your prescription history stays private, even from us."
    >
      {error && <StatusBanner tone="error">{error}</StatusBanner>}
      <form onSubmit={handleSubmit} noValidate>
        <FormField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="btn btn--primary" type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send reset link"}
        </button>
      </form>
      <p className="auth-switch">
        <Link to="/login">Back to sign in</Link>
      </p>
    </AuthLayout>
  );
}
