import { useState, useEffect } from "react";
import { Loader2, AlertTriangle, Clock, WifiOff } from "lucide-react";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import SensorCard from "../components/SensorCard";
import TrendChart from "../components/TrendChart";
import MaintenanceSummaryCard from "../components/MaintenanceSummaryCard";
import AlertSummaryCard from "../components/AlertSummaryCard";
import EnergySummaryCard from "../components/EnergySummaryCard";
import MachineSelector from "../components/MachineSelector";
import { useMachines } from "../hooks/useMachines";
import { useDashboard } from "../hooks/useDashboard";
import { getAlertSummary } from "../services/alertService";

export default function Dashboard() {
  const { machines, loading: machinesLoading } = useMachines();
  const [selectedMachineId, setSelectedMachineId] = useState(null);
  const [alertSummary, setAlertSummary] = useState(null);

  useEffect(() => {
    if (!selectedMachineId && machines.length > 0) {
      const lathe = machines.find((m) => m.name === "Lathe-01");
      setSelectedMachineId(lathe ? lathe.id : machines[0].id);
    }
  }, [machines, selectedMachineId]);

  useEffect(() => {
    if (!selectedMachineId) return;
    const fetchSummary = () =>
      getAlertSummary(selectedMachineId).then(setAlertSummary).catch(() => {});
    fetchSummary();
    const interval = setInterval(fetchSummary, 8000);
    return () => clearInterval(interval);
  }, [selectedMachineId]);

  const { data, loading, error } = useDashboard(selectedMachineId);

  if (machinesLoading || (loading && !data)) {
    return (
      <div className="panel p-10 flex items-center justify-center text-gray-500 gap-2">
        <Loader2 size={18} className="animate-spin" /> Loading dashboard…
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="panel p-6 flex items-center gap-3 text-status-critical">
        <AlertTriangle size={18} /> {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="panel p-10 text-center text-gray-500">
        No machines available. Add a machine in Machine Management to get started.
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <PageHeader title="Dashboard" description="Machine-level overview" />
        <MachineSelector
          machines={machines}
          selectedId={selectedMachineId}
          onChange={setSelectedMachineId}
        />
      </div>

      {/* Machine Overview */}
      <div className="panel p-4 mb-6 flex flex-wrap items-center gap-6">
        <div>
          <div className="text-xs text-gray-500 mb-1">Machine</div>
          <div className="text-lg font-semibold text-gray-100">{data.machine_name}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Status</div>
          <StatusBadge status={data.status} />
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Connectivity</div>
          <div className="flex items-center gap-1.5 text-sm text-gray-400">
            <WifiOff size={14} className="text-status-offline" /> {data.connectivity}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-500">
          <Clock size={12} /> Updated {new Date(data.last_updated).toLocaleTimeString()}
        </div>
        <span className="demo-tag">Simulated Data</span>
      </div>

      {/* Sensor Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {data.sensors.map((sensor) => (
          <SensorCard key={sensor.parameter} sensor={sensor} />
        ))}
      </div>

      {/* Trend Chart */}
      <div className="mb-6">
        <TrendChart trend={data.trend} />
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <MaintenanceSummaryCard maintenance={data.maintenance} />
        <AlertSummaryCard alerts={alertSummary || data.alerts} />
        <EnergySummaryCard energy={data.energy} />
      </div>
    </div>
  );
}