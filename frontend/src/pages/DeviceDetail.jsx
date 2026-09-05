import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Loader2, AlertTriangle, ArrowLeft, Cpu, Radio } from "lucide-react";
import PageHeader from "../components/PageHeader";
import DeviceStatusBadge from "../components/DeviceStatusBadge";
import StatusBadge from "../components/StatusBadge";
import { getDevice, getDeviceSensorMapping } from "../services/deviceService";

const PARAM_LABELS = {
  vibration: "Vibration", temperature: "Temperature", current: "Current", voltage: "Voltage", rpm: "RPM",
};

export default function DeviceDetail() {
  const { deviceId } = useParams();
  const [device, setDevice] = useState(null);
  const [mapping, setMapping] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([getDevice(deviceId), getDeviceSensorMapping(deviceId)])
      .then(([dev, map]) => { setDevice(dev); setMapping(map); })
      .catch((err) => setError(err.message || "Failed to load device"))
      .finally(() => setLoading(false));
  }, [deviceId]);

  if (loading) {
    return (
      <div className="panel p-10 flex items-center justify-center text-gray-500 gap-2">
        <Loader2 size={18} className="animate-spin" /> Loading device…
      </div>
    );
  }

  if (error || !device) {
    return (
      <div className="panel p-6 flex items-center gap-3 text-status-critical">
        <AlertTriangle size={18} /> {error || "Device not found"}
      </div>
    );
  }

  return (
    <div>
      <Link to="/devices" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 mb-4">
        <ArrowLeft size={14} /> Back to Devices
      </Link>

      <PageHeader title={device.device_name} description={`${device.device_type} · ${device.protocol}`} />

      <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded px-3 py-2">
        <Cpu size={13} /> Simulation / Not Connected — no physical ESP32 hardware is active
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="panel p-4 space-y-2 text-sm">
          <h3 className="text-sm font-medium text-gray-300 mb-2">Device Information</h3>
          <Row label="Firmware Version" value={device.firmware_version || "—"} />
          <Row label="Connection Status" value={<DeviceStatusBadge status={device.connection_status} />} />
          <Row label="Last Seen" value={device.last_seen ? new Date(device.last_seen).toLocaleString() : "Never"} />
          <Row label="Last Message" value={device.last_message || "No messages received"} />
        </div>

        <div className="panel p-4 space-y-2 text-sm">
          <h3 className="text-sm font-medium text-gray-300 mb-2">Communication</h3>
          <Row label="Protocol" value={device.protocol} />
          <Row label="MQTT Topic (planned)" value={<code className="text-xs text-gray-400">{device.mqtt_topic}</code>} />
        </div>
      </div>

      <div className="panel p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
          <Radio size={16} className="text-accent" /> Sensor Mapping
        </h3>
        <div className="space-y-2">
          {mapping.map((m) => (
            <div key={m.sensor_id} className="flex items-center justify-between bg-surface-elevated rounded p-3 text-sm">
              <span className="text-gray-300">{PARAM_LABELS[m.parameter] || m.parameter} ({m.unit})</span>
              <StatusBadge status={m.state} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-200">{value}</span>
    </div>
  );
}