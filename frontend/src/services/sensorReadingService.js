import apiClient from "./apiClient";

export async function getSensorHistory(sensorId, limit = 60) {
  const { data } = await apiClient.get(`/api/sensor-readings/${sensorId}/history`, {
    params: { limit },
  });
  return data;
}

export async function getSensorLatest(sensorId) {
  const { data } = await apiClient.get(`/api/sensor-readings/${sensorId}/latest`);
  return data;
}