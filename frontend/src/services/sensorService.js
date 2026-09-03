import apiClient from "./apiClient";

export async function getSensors(machineId = null) {
  const params = machineId ? { machine_id: machineId } : {};
  const { data } = await apiClient.get("/api/sensors/", { params });
  return data;
}

export async function getSensor(sensorId) {
  const { data } = await apiClient.get(`/api/sensors/${sensorId}`);
  return data;
}

export async function updateThresholds(sensorId, payload) {
  const { data } = await apiClient.patch(`/api/sensors/${sensorId}/thresholds`, payload);
  return data;
}

export async function toggleSampling(sensorId, enabled) {
  const { data } = await apiClient.patch(`/api/sensors/${sensorId}/sampling`, {
    sampling_enabled: enabled,
  });
  return data;
}