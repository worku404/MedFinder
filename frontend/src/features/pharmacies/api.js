import { apiFetch } from "../../lib/apiClient";
import { buildQuery, cursorFromUrl } from "../../lib/pagination";

// Re-exported so existing imports of `cursorFromUrl` from this module
// (e.g. MyPharmaciesPage) keep working — the implementation itself now
// lives in one place (lib/pagination.js) instead of being duplicated
// per feature.
export { cursorFromUrl };

export const pharmaciesApi = {
  // Public — no auth required, matches security: [] on these two paths.
  list: (params) => apiFetch(`/api/pharmacies/${buildQuery(params)}`, { auth: false }),
  retrieve: (id) => apiFetch(`/api/pharmacies/${id}/`, { auth: false }),

  // Pharmacist-owned — every /mine/ call needs the Bearer token, which
  // apiFetch already attaches by default (auth: true).
  mineList: (params) => apiFetch(`/api/pharmacies/mine/${buildQuery(params)}`),
  mineRetrieve: (id) => apiFetch(`/api/pharmacies/mine/${id}/`),
  mineCreate: (payload) => apiFetch("/api/pharmacies/mine/", { method: "POST", body: payload }),
  mineUpdate: (id, payload) => apiFetch(`/api/pharmacies/mine/${id}/`, { method: "PUT", body: payload }),
  minePartialUpdate: (id, payload) =>
    apiFetch(`/api/pharmacies/mine/${id}/`, { method: "PATCH", body: payload }),
  mineDestroy: (id) => apiFetch(`/api/pharmacies/mine/${id}/`, { method: "DELETE" }),

  // Join a pharmacy via invite code (staff pharmacist membership)
  join: (inviteCode) =>
    apiFetch("/api/pharmacies/join/", {
      method: "POST",
      body: { invite_code: inviteCode },
    }),

  // Staff & Invite management (Owner-only)
  listStaff: (pharmacyId) => apiFetch(`/api/pharmacies/mine/${pharmacyId}/staff/`),
  approveStaff: (pharmacyId, staffId) =>
    apiFetch(`/api/pharmacies/mine/${pharmacyId}/approve_staff/`, {
      method: "POST",
      body: { staff_id: staffId },
    }),
  rejectStaff: (pharmacyId, staffId) =>
    apiFetch(`/api/pharmacies/mine/${pharmacyId}/reject_staff/`, {
      method: "POST",
      body: { staff_id: staffId },
    }),
  listInvites: (pharmacyId) => apiFetch(`/api/pharmacies/mine/${pharmacyId}/invites/`),
  createInvite: (pharmacyId, payload = {}) =>
    apiFetch(`/api/pharmacies/mine/${pharmacyId}/invites/`, {
      method: "POST",
      body: payload,
    }),
};

