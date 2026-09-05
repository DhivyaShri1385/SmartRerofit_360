/**
 * Sole data-access point for Live Monitoring. Swapping the simulated
 * backend for real ESP32/MQTT/WebSocket data later only requires
 * changing what this function calls — no component changes needed.
 */
import apiClient from "./apiClient";

export async function getLiveSnapshot(machineId) {
  const { data } = await apiClient.get(`/api/machines/${machineId}/live`);
  return data;
}