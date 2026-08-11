import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./routes/ProtectedRoute";

import { LoginPage } from "./features/accounts/pages/LoginPage";
import { RegisterPage } from "./features/accounts/pages/RegisterPage";
import { CheckEmailPage } from "./features/accounts/pages/CheckEmailPage";
import { VerifyEmailPage } from "./features/accounts/pages/VerifyEmailPage";
import { GoogleCallbackPage } from "./features/accounts/pages/GoogleCallbackPage";
import { PasswordResetRequestPage } from "./features/accounts/pages/PasswordResetRequestPage";
import { PasswordResetConfirmPage } from "./features/accounts/pages/PasswordResetConfirmPage";
import { AccountSettingsPage } from "./features/accounts/pages/AccountSettingsPage";

import { MyPharmaciesPage } from "./features/pharmacies/pages/MyPharmaciesPage";
import { PharmacyCreatePage } from "./features/pharmacies/pages/PharmacyCreatePage";
import { PharmacyEditPage } from "./features/pharmacies/pages/PharmacyEditPage";
import { PublicPharmacyPage } from "./features/pharmacies/pages/PublicPharmacyPage";

// Centralized here so every page gets these regardless of which one
// mounts first — see the README for why this beats per-page imports.
import "./components/forms.css";
import "./features/pharmacies/pharmacies.css";

export function AppRoutes() {
  return (
    <Routes>
      {/* Accounts — /verify-email/:key and /register/check-email stay wired
          up even though the current registration flow skips them (see
          README: ACCOUNT_EMAIL_VERIFICATION is 'none'), since the
          resend/verify endpoints are still live on the backend. */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/register/check-email" element={<CheckEmailPage />} />
      <Route path="/verify-email/:key" element={<VerifyEmailPage />} />
      <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
      <Route path="/password-reset" element={<PasswordResetRequestPage />} />
      <Route path="/password-reset/confirm/:uid/:token" element={<PasswordResetConfirmPage />} />
      <Route
        path="/account"
        element={
          <ProtectedRoute>
            <AccountSettingsPage />
          </ProtectedRoute>
        }
      />

      {/* Pharmacies */}
      <Route path="/pharmacies/:id" element={<PublicPharmacyPage />} />
      <Route
        path="/pharmacies/mine"
        element={
          <ProtectedRoute>
            <MyPharmaciesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pharmacies/mine/new"
        element={
          <ProtectedRoute>
            <PharmacyCreatePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pharmacies/mine/:id/edit"
        element={
          <ProtectedRoute>
            <PharmacyEditPage />
          </ProtectedRoute>
        }
      />

      {/* Default fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
