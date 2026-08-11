import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { FormField } from "../../../components/FormField";
import { RoleToggle } from "../components/RoleToggle";
import { StatusBanner } from "../../../components/StatusBanner";
import { useAuth } from "../../../context/AuthContext";
import { ApiError } from "../../../lib/apiClient";
import { startGoogleLogin } from "../googleOAuth";

const initialForm = { username: "", email: "", password1: "", password2: "", role: "customer" };

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSubmitting(true);
    try {
      await register(form);
      navigate("/login", { state: { justRegistered: true, email: form.email } });
    } catch (err) {
      if (err instanceof ApiError && err.data && typeof err.data === "object") {
        setFieldErrors(err.data);
      }
      setError(err instanceof ApiError ? err.message : "Registration failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const isPharmacist = form.role === "pharmacist";

  return (
    <AuthLayout
      eyebrow="Create account"
      title={isPharmacist ? "List your pharmacy's stock" : "Create your account"}
      subtitle={
        isPharmacist
          ? "An administrator reviews every new pharmacy before it appears in search."
          : "Search medicine availability across verified pharmacies."
      }
      panelNote="Prescription photos are only used to read medicine names — never stored longer than 72 hours."
    >
      {error && <StatusBanner tone="error">{error}</StatusBanner>}
      <form onSubmit={handleSubmit} noValidate>
        <RoleToggle value={form.role} onChange={(role) => setForm({ ...form, role })} />
        <FormField
          id="username"
          label="Username"
          required
          value={form.username}
          onChange={update("username")}
          error={fieldErrors.username?.[0]}
        />
        <FormField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={update("email")}
          error={fieldErrors.email?.[0]}
        />
        <FormField
          id="password1"
          label="Password"
          type="password"
          autoComplete="new-password"
          required
          value={form.password1}
          onChange={update("password1")}
          error={fieldErrors.password1?.[0]}
        />
        <FormField
          id="password2"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          required
          value={form.password2}
          onChange={update("password2")}
          error={fieldErrors.password2?.[0]}
        />
        <button className="btn btn--primary" type="submit" disabled={submitting}>
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>
      <div className="divider">or</div>
      <button className="btn btn--google" type="button" onClick={startGoogleLogin}>
        Continue with Google
      </button>
      <p className="auth-switch">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
