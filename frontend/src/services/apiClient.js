/**
 * Single Axios instance for the whole app.
 * All API calls MUST go through service files that use this client —
 * never hardcode a fetch URL inside a component.
 */
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("sr360_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Centralized error normalization consumed by hooks/pages.
    const message =
      error.response?.data?.detail || error.message || "Unexpected network error";
    return Promise.reject({ ...error, message });
  }
);

export default apiClient;