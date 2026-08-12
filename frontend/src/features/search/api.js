import { apiFetch } from "../../lib/apiClient";

// /api/search/ uses PageNumberPagination, not the project-wide
// CursorPagination default (see backend search/views.py) — ranked/
// relevance results don't fit cursor pagination's "stable ordering
// column" assumption, since similarity/distance are recomputed per
// request rather than being a fixed column to page against. So this
// takes a plain 1-based `page` number instead of an opaque cursor
// token, and the response shape is DRF's standard
// {count, next, previous, results} rather than the cursor shape.
function buildSearchQuery({ q, lat, lng, page } = {}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (lat != null) params.set("lat", lat);
  if (lng != null) params.set("lng", lng);
  if (page) params.set("page", page);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const searchApi = {
  // Public per FR-SRCH-3 — auth: false so a signed-out visitor's search
  // (the common case) is never blocked by a missing/expired token.
  search: (params) => apiFetch(`/api/search/${buildSearchQuery(params)}`, { auth: false }),
};
