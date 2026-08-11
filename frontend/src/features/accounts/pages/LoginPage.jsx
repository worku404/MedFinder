import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { FormField } from "../components/FormField";
import { StatusBanner } from "../components/StatusBanner";
import { useAuth } from "../../../context/AuthContext";
import { ApiError } from "../../../lib/apiClient";
import { startGoogleLogin } from "../googleOAuth";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || "/account";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Sign in"
      title="Find it before you drive there"
      subtitle="Check live stock across registered pharmacies near you."
      panelNote="Every listing here is confirmed by a real pharmacist, and flagged the moment it goes stale."
    >
      {error && <StatusBanner tone="error">{error}</StatusBanner>}
      <form onSubmit={handleSubmit} noValidate>
        <FormField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <FormField
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <div className="auth-links auth-links--tight">
          <Link to="/password-reset">Forgot password?</Link>
        </div>
        <button className="btn btn--primary" type="submit" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <div className="divider">or</div>
      <button className="btn btn--google" type="button" onClick={startGoogleLogin}>
        Continue with Google
      </button>
      <p className="auth-switch">
        New to MedFinder? <Link to="/register">Create an account</Link>
      </p>
    </AuthLayout>
  );
}
