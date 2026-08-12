import { apiFetch } from "../../lib/apiClient";
import { buildQuery } from "../../lib/pagination";

// All pharmacist-owned — every call needs the Bearer token, which
// apiFetch attaches by default (auth: true). InventoryViewSet on the
// backend scopes list()/retrieve()/etc. to pharmacies the signed-in
// user owns (FR-INV-1), so there's no separate "mine" prefix needed
// here the way pharmacies/medicines have — the whole endpoint already
// only ever returns/accepts the caller's own stock.
export const inventoryApi = {
  list: (params) => apiFetch(`/api/inventory/${buildQuery(params)}`),
  retrieve: (id) => apiFetch(`/api/inventory/${id}/`),
  create: (payload) => apiFetch("/api/inventory/", { method: "POST", body: payload }),
  partialUpdate: (id, payload) => apiFetch(`/api/inventory/${id}/`, { method: "PATCH", body: payload }),
  destroy: (id) => apiFetch(`/api/inventory/${id}/`, { method: "DELETE" }),
  // Reconfirms freshness without touching quantity/price (FR-INV-2).
  confirm: (id) => apiFetch(`/api/inventory/${id}/confirm/`, { method: "POST" }),
};
