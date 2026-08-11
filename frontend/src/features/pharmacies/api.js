import { apiFetch } from "../../lib/apiClient";

function buildQuery({ cursor, ordering, search } = {}) {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  if (ordering) params.set("ordering", ordering);
  if (search) params.set("search", search);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

// DRF's CursorPagination returns full next/previous URLs, not raw cursor
// values — this pulls the cursor param back out so it can be passed into
// the next list() call.
export function cursorFromUrl(url) {
  if (!url) return null;
  try {
    return new URL(url).searchParams.get("cursor");
  } catch {
    return null;
  }
}

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
};
