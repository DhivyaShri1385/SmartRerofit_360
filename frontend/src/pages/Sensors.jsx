import { Loader2, AlertTriangle, Inbox, Radio } from "lucide-react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import SensorStateBadge from "../components/SensorStateBadge";
import { useSensors } from "../hooks/useSensors";
import { useMachines } from "../hooks/useMachines";

const PARAM_LABELS = {
  vibration: "Vibration",
  temperature: "Temperature",
  current: "Current",
  voltage: "Voltage",
  rpm: "RPM",
};

export default function Sensors() {
  const { sensors, loading, error } = useSensors();
  const { machines } = useMachines();

  const machineName = (machineId) => machines.find((m) => m.id === machineId)?.name || "Unknown machine";

  return (
    <div>
      <PageHeader
        title="Sensor Monitoring"
        description="Prototype software — simulated sensor input (hardware not yet connected)"
      />

      {loading && (
        <div className="panel p-10 flex items-center justify-center text-gray-500 gap-2">
          <Loader2 size={18} className="animate-spin" /> Loading sensors…
        </div>
      )}

      {!loading && error && (
        <div className="panel p-6 flex items-center gap-3 text-status-critical">
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      {!loading && !error && sensors.length === 0 && (
        <div className="panel p-10 flex flex-col items-center justify-center text-gray-500 gap-2">
          <Inbox size={24} /> No sensors configured yet.
        </div>
      )}

      {!loading && !error && sensors.length > 0 && (
        <div className="panel overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-surface-border">
                <th className="px-4 py-3">Sensor</th>
                <th className="px-4 py-3">Machine</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3">State</th>
                <th className="px-4 py-3">Sampling</th>
                <th className="px-4 py-3">Last Update</th>
              </tr>
            </thead>
            <tbody>
              {sensors.map((sensor) => (
                <tr key={sensor.id} className="border-b border-surface-border last:border-0 hover:bg-surface-elevated">
                  <td className="px-4 py-3">
                    <Link to={`/sensors/${sensor.id}`} className="flex items-center gap-2 text-accent hover:underline">
                      <Radio size={14} /> {PARAM_LABELS[sensor.sensor_type] || sensor.sensor_type}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{machineName(sensor.machine_id)}</td>
                  <td className="px-4 py-3 text-gray-500">{sensor.unit}</td>
                  <td className="px-4 py-3"><SensorStateBadge state={sensor.state} /></td>
                  <td className="px-4 py-3 text-gray-500">{sensor.sampling_enabled ? "Enabled" : "Disabled"}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {sensor.last_update ? new Date(sensor.last_update).toLocaleString() : "No data yet"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}