import apiClient from "./apiClient";

export async function getMachines() {
  const { data } = await apiClient.get("/api/machines/");
  return data;
}

export async function getMachine(machineId) {
  const { data } = await apiClient.get(`/api/machines/${machineId}`);
  return data;
}

export async function createMachine(payload) {
  const { data } = await apiClient.post("/api/machines/", payload);
  return data;
}

export async function updateMachine(machineId, payload) {
  const { data } = await apiClient.patch(`/api/machines/${machineId}`, payload);
  return data;
}

export async function toggleMonitoring(machineId, enabled) {
  const { data } = await apiClient.patch(
    `/api/machines/${machineId}/monitoring?enabled=${enabled}`
  );
  return data;
}

export async function deactivateMachine(machineId) {
  await apiClient.delete(`/api/machines/${machineId}`);
}