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
    if (error.response?.status === 401) {
      // Notify AuthContext to clear session and let ProtectedRoute redirect to /login.
      window.dispatchEvent(new CustomEvent("sr360:session-expired"));
    }
    const message = error.response?.data?.detail || error.message || "Unexpected network error";
    return Promise.reject({ ...error, message });
  }
);

export default apiClient;