import { apiFetch } from "../../lib/apiClient";
import { buildQuery } from "../../lib/pagination";

export const medicinesApi = {
  list: (params) => apiFetch(`/api/medicines/${buildQuery(params)}`, { auth: false }),
  retrieve: (slug) => apiFetch(`/api/medicines/${slug}/`, { auth: false }),
  categoriesList: (params) => apiFetch(`/api/medicines/categories/${buildQuery(params)}`, { auth: false }),
  categoryRetrieve: (slug) => apiFetch(`/api/medicines/categories/${slug}/`, { auth: false }),
};
