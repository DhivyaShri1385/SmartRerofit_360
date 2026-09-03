import apiClient from "./apiClient";

export async function getSystemHealth() {
  const { data } = await apiClient.get("/api/health");
  return data;
}