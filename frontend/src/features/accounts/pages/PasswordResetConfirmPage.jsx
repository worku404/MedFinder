import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { FormField } from "../components/FormField";
import { StatusBanner } from "../components/StatusBanner";
import { accountsApi } from "../api";
import { ApiError } from "../../../lib/apiClient";

export function PasswordResetConfirmPage() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ new_password1: "", new_password2: "" });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (form.new_password1 !== form.new_password2) {
      setError("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    try {
      await accountsApi.passwordResetConfirm({ uid, token, ...form });
      navigate("/login", { state: { resetComplete: true } });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "This link may have expired.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Password reset"
      title="Set a new password"
      panelNote="Choose something you haven't used here before."
    >
      {error && <StatusBanner tone="error">{error}</StatusBanner>}
      <form onSubmit={handleSubmit} noValidate>
        <FormField
          id="new_password1"
          label="New password"
          type="password"
          autoComplete="new-password"
          required
          value={form.new_password1}
          onChange={(e) => setForm({ ...form, new_password1: e.target.value })}
        />
        <FormField
          id="new_password2"
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          required
          value={form.new_password2}
          onChange={(e) => setForm({ ...form, new_password2: e.target.value })}
        />
        <button className="btn btn--primary" type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Save new password"}
        </button>
      </form>
      <p className="auth-switch">
        <Link to="/login">Back to sign in</Link>
      </p>
    </AuthLayout>
  );
}
