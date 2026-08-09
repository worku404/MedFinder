// frontend/src/api/client.js
import axios from 'axios';

// In development: Vite dev server proxies /api → Django (see vite.config.js)
// In production: Nginx proxies /api → Django
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── REQUEST INTERCEPTOR ────────────────────────────────────────
// Before every request, attach the access token (if we have one)
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── RESPONSE INTERCEPTOR ───────────────────────────────────────
// If a request fails with 401 (token expired), try to refresh
// the access token using the refresh token, then retry the request.
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't already tried refreshing for this request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          // No refresh token — user must log in again
          clearTokens();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Call Django's token refresh endpoint
        const response = await axios.post(
          `${API_BASE_URL}/auth/token/refresh/`,
          { refresh: refreshToken }
        );

        const { access } = response.data;
        setAccessToken(access);

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed — force logout
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ─── TOKEN STORAGE ──────────────────────────────────────────────
// Access token: kept in memory only (a module-level variable).
// This means it's lost on page refresh — that's intentional and secure.
// On refresh, the app uses the refresh token to get a new access token.
//
// Refresh token: stored in localStorage.
// (For maximum security, use httpOnly cookies instead — but that
// requires Django to set the cookie, which is more complex to set up.
// localStorage is acceptable for a portfolio project.)

let inMemoryAccessToken = null;

function getAccessToken() {
  return inMemoryAccessToken;
}

function setAccessToken(token) {
  inMemoryAccessToken = token;
}

function getRefreshToken() {
  return localStorage.getItem('refreshToken');
}

function setRefreshToken(token) {
  localStorage.setItem('refreshToken', token);
}

function clearTokens() {
  inMemoryAccessToken = null;
  localStorage.removeItem('refreshToken');
}

export default apiClient;
export {
  setAccessToken,
  setRefreshToken,
  getRefreshToken,
  clearTokens,
};
