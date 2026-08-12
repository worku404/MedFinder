import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { AppShell } from "./components/AppShell";

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
import { JoinPharmacyPage } from "./features/pharmacies/pages/JoinPharmacyPage";
import { PharmacyStaffPage } from "./features/pharmacies/pages/PharmacyStaffPage";

import { CategoryListPage } from "./features/medicines/pages/CategoryListPage";
import { CategoryDetailPage } from "./features/medicines/pages/CategoryDetailPage";
import { MedicineListPage } from "./features/medicines/pages/MedicineListPage";
import { MedicineDetailPage } from "./features/medicines/pages/MedicineDetailPage";

import { SearchPage } from "./features/search/pages/SearchPage";

import { InventoryListPage } from "./features/inventory/pages/InventoryListPage";
import { InventoryCreatePage } from "./features/inventory/pages/InventoryCreatePage";
import { InventoryEditPage } from "./features/inventory/pages/InventoryEditPage";

// Centralized here so every page gets these regardless of which one
// mounts first — see the README for why this beats per-page imports.
import "./components/forms.css";
import "./features/pharmacies/pharmacies.css";
import "./features/medicines/medicines.css";
import "./features/search/search.css";
import "./features/inventory/inventory.css";

export function AppRoutes() {
  return (
    <Routes>
    <Route element={<AppShell />}>
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

      {/* Search — public per FR-SRCH-3, and the app's landing page: a
          medicine locator's home screen should be "find it now," not a
          login wall. Both paths render the same page so /search still
          works as a direct/shareable link. */}
      <Route path="/" element={<SearchPage />} />
      <Route path="/search" element={<SearchPage />} />

      {/* Medicines catalog — public, no auth required. The two static
          /medicines/categories* routes are declared before the dynamic
          /medicines/:slug so "categories" is never mistaken for a
          medicine slug (React Router ranks static segments above
          dynamic ones regardless of order, but keeping this order makes
          the intent obvious to a future reader too). */}
      <Route path="/medicines" element={<MedicineListPage />} />
      <Route path="/medicines/categories" element={<CategoryListPage />} />
      <Route path="/medicines/categories/:slug" element={<CategoryDetailPage />} />
      <Route path="/medicines/:slug" element={<MedicineDetailPage />} />

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
        path="/pharmacies/join"
        element={
          <ProtectedRoute>
            <JoinPharmacyPage />
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
      <Route
        path="/pharmacies/mine/:pharmacyId/staff"
        element={
          <ProtectedRoute>
            <PharmacyStaffPage />
          </ProtectedRoute>
        }
      />

      {/* Inventory — a pharmacist's stock for one of their own
          pharmacies. Nested under /pharmacies/mine/:pharmacyId so the
          URL itself expresses ownership, matching how the rest of the
          pharmacist-facing routes are structured. */}
      <Route
        path="/pharmacies/mine/:pharmacyId/inventory"
        element={
          <ProtectedRoute>
            <InventoryListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pharmacies/mine/:pharmacyId/inventory/new"
        element={
          <ProtectedRoute>
            <InventoryCreatePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pharmacies/mine/:pharmacyId/inventory/:id/edit"
        element={
          <ProtectedRoute>
            <InventoryEditPage />
          </ProtectedRoute>
        }
      />

      {/* Default fallback — unknown paths land on search, not a login
          wall, since most visitors to this app are anonymous searchers
          (FR-SRCH-3), not pharmacists who need to sign in. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
    </Routes>
  );
}
