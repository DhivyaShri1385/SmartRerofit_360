import { Loader2, AlertTriangle, Inbox, Cpu } from "lucide-react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import DeviceStatusBadge from "../components/DeviceStatusBadge";
import { useMachines } from "../hooks/useMachines";
import { useEffect, useState } from "react";
import { getDevices } from "../services/deviceService";
import { useEffect as useEffect2 } from "react"; // (or just reuse existing useEffect import)
import apiClient from "../services/apiClient";

export default function Devices() {
  const { machines } = useMachines();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mqttStatus, setMqttStatus] = useState(null);
useEffect(() => {
  apiClient.get("/api/mqtt/status").then((res) => setMqttStatus(res.data)).catch(() => {});
}, []);

  const machineName = (id) => machines.find((m) => m.id === id)?.name || "Unknown";

  useEffect(() => {
    getDevices()
      .then(setDevices)
      .catch((err) => setError(err.message || "Failed to load devices"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        title="IoT / Device Management"
        description="Prepared for future ESP32 hardware integration — no physical devices are connected"
      />

      <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded px-3 py-2">
        <Cpu size={13} /> Simulation / Not Connected
      </div>

      {loading && (
        <div className="panel p-10 flex items-center justify-center text-gray-500 gap-2">
          <Loader2 size={18} className="animate-spin" /> Loading devices…
        </div>
      )}

      {!loading && error && (
        <div className="panel p-6 flex items-center gap-3 text-status-critical">
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      {!loading && !error && devices.length === 0 && (
        <div className="panel p-10 flex flex-col items-center justify-center text-gray-500 gap-2">
          <Inbox size={24} /> No devices configured yet.
        </div>
      )}

      {mqttStatus && (
  <div className="panel p-4 mb-6">
    <h3 className="text-sm font-medium text-gray-300 mb-3">MQTT Architecture (Planned)</h3>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-3">
      <div>
        <div className="text-[11px] text-gray-500 mb-0.5">Broker</div>
        <div className="text-gray-300">{mqttStatus.broker_host}:{mqttStatus.broker_port}</div>
      </div>
      <div>
        <div className="text-[11px] text-gray-500 mb-0.5">Connected</div>
        <div className="text-status-offline">{mqttStatus.connected ? "Yes" : "No — hardware not connected"}</div>
      </div>
      <div className="col-span-2">
        <div className="text-[11px] text-gray-500 mb-0.5">Topic Pattern</div>
        <code className="text-xs text-gray-400">{mqttStatus.topic_pattern}</code>
      </div>
    </div>
    <div className="text-[11px] text-gray-500 mb-1">Example message schema:</div>
    <pre className="text-[11px] text-gray-400 bg-surface-elevated rounded p-2 overflow-x-auto">
      {JSON.stringify(mqttStatus.message_schema_example, null, 2)}
    </pre>
  </div>
)}

      {!loading && !error && devices.length > 0 && (
        <div className="panel overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-surface-border">
                <th className="px-4 py-3">Device</th>
                <th className="px-4 py-3">Machine</th>
                <th className="px-4 py-3">Firmware</th>
                <th className="px-4 py-3">Protocol</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last Seen</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((d) => (
                <tr key={d.id} className="border-b border-surface-border last:border-0 hover:bg-surface-elevated">
                  <td className="px-4 py-3">
                    <Link to={`/devices/${d.id}`} className="flex items-center gap-2 text-accent hover:underline">
                      <Cpu size={14} /> {d.device_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{machineName(d.machine_id)}</td>
                  <td className="px-4 py-3 text-gray-500">{d.firmware_version || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{d.protocol}</td>
                  <td className="px-4 py-3"><DeviceStatusBadge status={d.connection_status} /></td>
                  <td className="px-4 py-3 text-gray-500">{d.last_seen ? new Date(d.last_seen).toLocaleString() : "Never"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}