import apiClient from "./apiClient";

export async function getMachineHealth(machineId) {
  const { data } = await apiClient.get(`/api/predictive-maintenance/${machineId}/health`);
  return data;
}

export async function getRecommendations(machineId) {
  const { data } = await apiClient.get(`/api/predictive-maintenance/${machineId}/recommendations`);
  return data;
}