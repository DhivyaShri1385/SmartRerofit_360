import apiClient from "./apiClient";

export async function getEnergyOverview(machineId) {
  const { data } = await apiClient.get(`/api/energy/${machineId}/overview`);
  return data;
}

export async function getEnergyTrend(machineId, hours = 1) {
  const { data } = await apiClient.get(`/api/energy/${machineId}/trend`, { params: { hours } });
  return data;
}

export async function getMachineEnergyComparison() {
  const { data } = await apiClient.get("/api/energy/comparison");
  return data;
}