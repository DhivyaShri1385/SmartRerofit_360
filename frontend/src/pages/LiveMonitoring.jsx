import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Loader2, WifiOff, AlertTriangle, Radio } from "lucide-react";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import MachineSelector from "../components/MachineSelector";
import LiveParameterTile from "../components/LiveParameterTile";
import { useMachines } from "../hooks/useMachines";
import { useLiveMonitoring } from "../hooks/useLiveMonitoring";

const PARAM_COLORS = {
  vibration: "#0ea5e9",
  temperature: "#f59e0b",
  current: "#22c55e",
  voltage: "#a855f7",
  rpm: "#ef4444",
};

export default function LiveMonitoring() {
  const { machines, loading: machinesLoading } = useMachines();
  const [selectedMachineId, setSelectedMachineId] = useState(null);

  useEffect(() => {
    if (!selectedMachineId && machines.length > 0) {
      const lathe = machines.find((m) => m.name === "Lathe-01");
      setSelectedMachineId(lathe ? lathe.id : machines[0].id);
    }
  }, [machines, selectedMachineId]);

  const { snapshot, loading, connectionError } = useLiveMonitoring(selectedMachineId);

  if (machinesLoading || (loading && !snapshot)) {
    return (
      <div className="panel p-10 flex items-center justify-center text-gray-500 gap-2">
        <Loader2 size={18} className="animate-spin" /> Connecting to live data stream…
      </div>
    );
  }

  if (connectionError && !snapshot) {
    return (
      <div className="panel p-6 flex items-center gap-3 text-status-critical">
        <WifiOff size={18} /> Unable to reach the backend. Check that the API server is running.
      </div>
    );
  }

  if (!snapshot) {
    return (
      <div className="panel p-10 text-center text-gray-500">
        No machines available. Add a machine in Machine Management to get started.
      </div>
    );
  }

  const hasAnyData = snapshot.sensors.some((s) => s.value !== null);
  const isOffline = !snapshot.monitoring_enabled || snapshot.connectivity === "offline";

  const chartData = snapshot.history.map((point) => ({
    ...point,
    time: new Date(point.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
  }));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <PageHeader title="Live Machine Monitoring" description="Simulated real-time parameter streaming" />
        <MachineSelector machines={machines} selectedId={selectedMachineId} onChange={setSelectedMachineId} />
      </div>

      <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded px-3 py-2">
        <Radio size={13} /> SIMULATED DATA — HARDWARE NOT CONNECTED
      </div>

      {connectionError && (
        <div className="mb-4 flex items-center gap-2 text-xs text-status-critical bg-status-critical/10 border border-status-critical/30 rounded px-3 py-2">
          <WifiOff size={14} /> Connection interrupted — showing last known values.
        </div>
      )}

      <div className="panel p-4 mb-6 flex flex-wrap items-center gap-6">
        <div>
          <div className="text-xs text-gray-500 mb-1">Machine</div>
          <div className="text-lg font-semibold text-gray-100">{snapshot.machine_name}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Status</div>
          <StatusBadge status={snapshot.status} />
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Connectivity</div>
          <StatusBadge status={snapshot.connectivity} />
        </div>
        <div className="ml-auto text-xs text-gray-500">
          Server time: {new Date(snapshot.server_time).toLocaleTimeString()}
        </div>
      </div>

      {isOffline && (
        <div className="panel p-6 flex items-center gap-3 text-gray-500 mb-6">
          <AlertTriangle size={18} className="text-status-offline" />
          This machine is offline or monitoring is disabled. Enable monitoring in Machine Management to resume simulation.
        </div>
      )}

      {!isOffline && !hasAnyData && (
        <div className="panel p-6 flex items-center gap-3 text-gray-500 mb-6">
          <AlertTriangle size={18} className="text-status-warning" />
          No sensors are enabled for this machine yet. Enable sampling in Sensor Management to begin streaming.
        </div>
      )}

      {/* Individual parameter tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {snapshot.sensors.map((sensor) => (
          <LiveParameterTile
            key={sensor.sensor_id}
            sensorPoint={sensor}
            sparklineData={chartData
              .filter((p) => p[sensor.parameter] !== undefined)
              .map((p) => ({ value: p[sensor.parameter] }))}
          />
        ))}
      </div>

      {/* Large combined real-time chart */}
      <div className="panel p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-3">Combined Parameter Trend</h3>
        {chartData.length > 1 ? (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a323d" />
              <XAxis dataKey="time" stroke="#6b7280" fontSize={11} />
              <YAxis stroke="#6b7280" fontSize={11} />
              <Tooltip contentStyle={{ background: "#161b22", border: "1px solid #2a323d", borderRadius: 6, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {Object.entries(PARAM_COLORS).map(([param, color]) => (
                <Line
                  key={param}
                  type="monotone"
                  dataKey={param}
                  name={param}
                  stroke={color}
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-56 flex items-center justify-center text-gray-500 text-sm">
            Waiting for enough data points to plot a trend…
          </div>
        )}
      </div>
    </div>
  );
}