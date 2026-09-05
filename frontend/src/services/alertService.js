import apiClient from "./apiClient";

export async function getAlerts(filters = {}) {
  const { data } = await apiClient.get("/api/alerts/", { params: filters });
  return data;
}

export async function getAlert(alertId) {
  const { data } = await apiClient.get(`/api/alerts/${alertId}`);
  return data;
}

export async function getAlertSummary(machineId = null) {
  const params = machineId ? { machine_id: machineId } : {};
  const { data } = await apiClient.get("/api/alerts/summary", { params });
  return data;
}

export async function acknowledgeAlert(alertId) {
  const { data } = await apiClient.patch(`/api/alerts/${alertId}/acknowledge`);
  return data;
}

export async function resolveAlert(alertId) {
  const { data } = await apiClient.patch(`/api/alerts/${alertId}/resolve`);
  return data;
}