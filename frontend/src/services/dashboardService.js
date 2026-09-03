import apiClient from "./apiClient";

export async function getDashboardOverview(machineId) {
  const { data } = await apiClient.get(`/api/dashboard/${machineId}/overview`);
  return data;
}