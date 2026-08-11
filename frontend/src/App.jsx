import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./features/accounts/pages/LoginPage";
import { RegisterPage } from "./features/accounts/pages/RegisterPage";
import { CheckEmailPage } from "./features/accounts/pages/CheckEmailPage";
import { VerifyEmailPage } from "./features/accounts/pages/VerifyEmailPage";
import { GoogleCallbackPage } from "./features/accounts/pages/GoogleCallbackPage";
import { PasswordResetRequestPage } from "./features/accounts/pages/PasswordResetRequestPage";
import { PasswordResetConfirmPage } from "./features/accounts/pages/PasswordResetConfirmPage";
import { AccountSettingsPage } from "./features/accounts/pages/AccountSettingsPage";
import "./features/accounts/accounts.css";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register/check-email" element={<CheckEmailPage />} />
        <Route path="/verify-email/:key" element={<VerifyEmailPage />} />
        <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
        <Route path="/password-reset" element={<PasswordResetRequestPage />} />
        <Route path="/password-reset/:uid/:token" element={<PasswordResetConfirmPage />} />

        {/* Protected routes */}
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <AccountSettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}
