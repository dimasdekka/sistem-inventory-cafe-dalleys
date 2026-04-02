import axios from "axios";
import axiosRetry from "axios-retry";
import { API_BASE_URL, API_TIMEOUT } from "@/constants";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Retry logic ────────────────────────────────────────────────
axiosRetry(apiClient, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) =>
    axiosRetry.isNetworkError(error) ||
    (error.response?.status !== undefined && error.response.status >= 500),
});

// ── Request interceptor — attach auth token ────────────────────
apiClient.interceptors.request.use(
  (config) => {
    // Token is in-memory via Zustand; accessed at call time to avoid circular import
    // Token is injected by useAuth hook via setAuthHeader()
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor — unwrap data ────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear session and redirect to login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

/** Call this after login to set the Authorization header globally */
export const setAuthHeader = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common["Authorization"];
  }
};
