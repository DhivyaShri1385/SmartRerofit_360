import apiClient from "./apiClient";

export async function getDevices(machineId = null) {
  const params = machineId ? { machine_id: machineId } : {};
  const { data } = await apiClient.get("/api/devices/", { params });
  return data;
}

export async function getDevice(deviceId) {
  const { data } = await apiClient.get(`/api/devices/${deviceId}`);
  return data;
}

export async function getDeviceSensorMapping(deviceId) {
  const { data } = await apiClient.get(`/api/devices/${deviceId}/sensor-mapping`);
  return data;
}

export async function updateDevice(deviceId, payload) {
  const { data } = await apiClient.patch(`/api/devices/${deviceId}`, payload);
  return data;
}