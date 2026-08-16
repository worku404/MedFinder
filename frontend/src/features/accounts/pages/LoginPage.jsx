import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { FormField } from "../../../components/FormField";
import { StatusBanner } from "../../../components/StatusBanner";
import { useAuth } from "../../../context/AuthContext";
import { ApiError } from "../../../lib/apiClient";
import { startGoogleLogin } from "../googleOAuth";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: location.state?.email || "",
    password: "",
  });

  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || "/account";
  const justRegistered = location.state?.justRegistered;

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError(null);
    setSubmitting(true);

    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Trusted Pharmacy Network"
      title={
        <>
          Find the medicine you need.
          <span className="text-[#0e8a82]"> Before you drive there.</span>
        </>
      }
      subtitle="Check real-time medicine availability at verified pharmacies near you."
      panelNote="Every pharmacy listing is verified by a pharmacist and regularly updated, helping you find available medicines with confidence."
    >
      {/* =====================================================
          FIXED LIGHT LOGIN FORM
          This entire section stays light in dark mode.
      ===================================================== */}
      <div className="auth-form-light">
        {/* =====================================================
            LOGIN HEADER
        ===================================================== */}
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#0e8a82] opacity-60 animate-ping" />

              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#0e8a82]" />
            </span>

            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#4d6360]">
              Secure access
            </span>
          </div>

          <h2 className="text-[32px] leading-tight font-bold tracking-[-0.03em] text-[#0e1b1a]">
            Welcome back
          </h2>

          <p className="mt-2.5 text-sm leading-6 text-[#4d6360]">
            Sign in to continue finding medicines near you.
          </p>
        </div>

        {/* =====================================================
            STATUS
        ===================================================== */}
        {justRegistered && !error && (
          <div className="mb-5">
            <StatusBanner tone="info">
              Account created successfully — sign in below.
            </StatusBanner>
          </div>
        )}

        {error && (
          <div className="mb-5">
            <StatusBanner tone="error">{error}</StatusBanner>
          </div>
        )}

        {/* =====================================================
            LOGIN FORM
        ===================================================== */}
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <FormField
            id="email"
            label="Email address"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
          />

          <FormField
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
          />

          {/* =================================================
              FORGOT PASSWORD
          ================================================= */}
          <div className="flex justify-end -mt-1">
            <Link
              to="/password-reset"
              className="text-sm font-semibold text-[#0e8a82] hover:text-[#0b6e68] transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* =================================================
              SIGN IN BUTTON
          ================================================= */}
          <button
            className="
              group
              relative
              w-full
              h-[50px]
              overflow-hidden
              rounded-xl
              bg-[#0e8a82]
              text-white
              font-semibold
              shadow-[0_8px_20px_rgba(14,138,130,0.22)]
              transition-all
              duration-200
              hover:bg-[#0b6e68]
              hover:-translate-y-0.5
              hover:shadow-[0_12px_26px_rgba(14,138,130,0.28)]
              active:translate-y-0
              disabled:cursor-not-allowed
              disabled:opacity-60
              disabled:hover:translate-y-0
            "
            type="submit"
            disabled={submitting}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {submitting ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <svg
                    className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 12h14M13 6l6 6-6 6"
                    />
                  </svg>
                </>
              )}
            </span>
          </button>
        </form>

        {/* =====================================================
            DIVIDER
        ===================================================== */}
        <div className="flex items-center gap-4 my-7">
          <div className="h-px flex-1 bg-[#cbdcda]" />

          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#71807e]">
            Or continue with
          </span>

          <div className="h-px flex-1 bg-[#cbdcda]" />
        </div>

        {/* =====================================================
            GOOGLE LOGIN
        ===================================================== */}
        <button
          className="
            group
            w-full
            h-12
            rounded-xl
            border
            border-[#cbdcda]
            bg-white
            hover:bg-[#f8fbfa]
            hover:border-[#a9c5c2]
            text-[#0e1b1a]
            font-semibold
            transition-all
            duration-200
            flex
            items-center
            justify-center
            gap-3
            shadow-sm
            hover:shadow-md
          "
          type="button"
          onClick={startGoogleLogin}
        >
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white shadow-sm border border-slate-100">
            <svg
              className="w-[18px] h-[18px]"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fill="#4285F4"
                d="M21.35 12.23c0-.79-.07-1.55-.2-2.27H12v4.3h5.23a4.47 4.47 0 0 1-1.94 2.93v2.43h3.14c1.84-1.69 2.92-4.18 2.92-7.39Z"
              />

              <path
                fill="#34A853"
                d="M12 21.5c2.63 0 4.84-.87 6.45-2.35l-3.14-2.43c-.87.58-1.98.92-3.31.92-2.54 0-4.7-1.72-5.47-4.03H3.28v2.5A9.75 9.75 0 0 0 12 21.5Z"
              />

              <path
                fill="#FBBC05"
                d="M6.53 13.61A5.86 5.86 0 0 1 6.22 12c0-.56.11-1.1.31-1.61v-2.5H3.28A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.03 4.39l3.25-2.78Z"
              />

              <path
                fill="#EA4335"
                d="M12 6.36c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.48 14.63 2.5 12 2.5a9.75 9.75 0 0 0-8.72 5.39l3.25 2.5c.77-2.31 2.93-4.03 5.47-4.03Z"
              />
            </svg>
          </span>

          <span>Continue with Google</span>
        </button>

        {/* =====================================================
            REGISTER
        ===================================================== */}
        <div className="mt-7 rounded-xl border border-[#d7e5e3] bg-[#f8fbfa] px-4 py-3.5">
          <p className="text-center text-sm text-[#4d6360]">
            New to <span className="font-bold text-[#0e1b1a]">MedFinder</span>?{" "}
            <Link
              to="/register"
              className="font-bold text-[#0e8a82] hover:text-[#0b6e68] transition-colors"
            >
              Create an account
            </Link>
          </p>
        </div>

        {/* =====================================================
            SECURITY NOTE
        ===================================================== */}
        <div className="mt-5 flex items-center justify-center gap-2.5">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#e7f3ec] text-[#2f7d4f]">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-7a2 2 0 00-2-2H6a2 2 0 00-2 2v7a2 2 0 002 2zm10-11V7a4 4 0 00-8 0v3h8z"
              />
            </svg>
          </span>

          <span className="text-xs font-medium text-[#71807e]">
            Your connection is secure
          </span>
        </div>
      </div>
    </AuthLayout>
  );
}
