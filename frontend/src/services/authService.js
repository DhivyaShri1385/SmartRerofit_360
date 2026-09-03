import apiClient from "./apiClient";

export async function login(username, password) {
  const { data } = await apiClient.post("/api/auth/login", { username, password });
  return data; // { access_token, token_type, user }
}

export async function getCurrentUser() {
  const { data } = await apiClient.get("/api/auth/me");
  return data;
}

export async function logout() {
  try {
    await apiClient.post("/api/auth/logout");
  } catch {
    // Non-fatal — logout is primarily a client-side token removal.
  }
}