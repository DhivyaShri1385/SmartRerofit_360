import apiClient from "./apiClient";

export async function getReport(filters = {}) {
  const { data } = await apiClient.get("/api/reports/", { params: filters });
  return data;
}

export function getCsvExportUrl(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  return `${base}/api/reports/export.csv${params ? `?${params}` : ""}`;
}