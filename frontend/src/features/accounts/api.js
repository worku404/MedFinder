// Endpoint calls matching MedFinder's openapi.yaml field-for-field.
import { apiFetch } from "../../lib/apiClient";

export const accountsApi = {
  register: (payload) =>
    apiFetch("/api/auth/register/", { method: "POST", body: payload, auth: false }),

  resendVerification: (email) =>
    apiFetch("/api/auth/register/resend-email/", { method: "POST", body: { email }, auth: false }),

  verifyEmail: (key) =>
    apiFetch("/api/auth/register/verify-email/", { method: "POST", body: { key }, auth: false }),

  // ACCOUNT_LOGIN_METHODS = {'email'} in settings.py, so we authenticate
  // with email rather than username even though the Login schema allows both.
  login: (email, password) =>
    apiFetch("/api/auth/login/", { method: "POST", body: { email, password }, auth: false }),

  googleLogin: (code) =>
    apiFetch("/api/auth/google/", { method: "POST", body: { code }, auth: false }),

  logout: (refresh) => apiFetch("/api/auth/logout/", { method: "POST", body: { refresh } }),

  passwordReset: (email) =>
    apiFetch("/api/auth/password/reset/", { method: "POST", body: { email }, auth: false }),

  passwordResetConfirm: ({ uid, token, new_password1, new_password2 }) =>
    apiFetch("/api/auth/password/reset/confirm/", {
      method: "POST",
      body: { uid, token, new_password1, new_password2 },
      auth: false,
    }),

  passwordChange: ({ new_password1, new_password2 }) =>
    apiFetch("/api/auth/password/change/", { method: "POST", body: { new_password1, new_password2 } }),

  getUser: () => apiFetch("/api/auth/user/"),

  updateUser: (payload) => apiFetch("/api/auth/user/", { method: "PATCH", body: payload }),
};
