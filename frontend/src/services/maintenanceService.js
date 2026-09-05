import apiClient from "./apiClient";

export async function getMaintenanceRecords(filters = {}) {
  const { data } = await apiClient.get("/api/maintenance/", { params: filters });
  return data;
}

export async function getMaintenanceOverview(machineId = null) {
  const params = machineId ? { machine_id: machineId } : {};
  const { data } = await apiClient.get("/api/maintenance/overview", { params });
  return data;
}

export async function getMaintenanceRecord(recordId) {
  const { data } = await apiClient.get(`/api/maintenance/${recordId}`);
  return data;
}

export async function createMaintenanceRecord(payload) {
  const { data } = await apiClient.post("/api/maintenance/", payload);
  return data;
}

export async function updateMaintenanceRecord(recordId, payload) {
  const { data } = await apiClient.patch(`/api/maintenance/${recordId}`, payload);
  return data;
}

export async function deleteMaintenanceRecord(recordId) {
  await apiClient.delete(`/api/maintenance/${recordId}`);
}