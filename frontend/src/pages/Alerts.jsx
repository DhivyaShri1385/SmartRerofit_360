import { useState } from "react";
import { Loader2, AlertTriangle, Inbox, Check, CheckCheck } from "lucide-react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import AlertStatusBadge from "../components/AlertStatusBadge";
import { useAlerts } from "../hooks/useAlerts";
import { useMachines } from "../hooks/useMachines";
import { acknowledgeAlert, resolveAlert } from "../services/alertService";

const LEVELS = ["information", "warning", "critical"];
const STATUSES = ["active", "acknowledged", "resolved"];

export default function Alerts() {
  const { machines } = useMachines();
  const [machineFilter, setMachineFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filters = {
    ...(machineFilter && { machine_id: machineFilter }),
    ...(levelFilter && { level: levelFilter }),
    ...(statusFilter && { status: statusFilter }),
  };

  const { alerts, loading, error, refresh } = useAlerts(filters);

  const machineName = (id) => machines.find((m) => m.id === id)?.name || "Unknown";

  const handleAck = async (id) => {
    await acknowledgeAlert(id);
    refresh();
  };

  const handleResolve = async (id) => {
    await resolveAlert(id);
    refresh();
  };

  return (
    <div>
      <PageHeader title="Alerts & Notifications" description="Demo alerts generated from simulated sensor thresholds" />

      <div className="flex flex-wrap gap-3 mb-4">
        <select value={machineFilter} onChange={(e) => setMachineFilter(e.target.value)} className="bg-surface-elevated border border-surface-border rounded text-sm text-gray-300 px-3 py-1.5">
          <option value="">All machines</option>
          {machines.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} className="bg-surface-elevated border border-surface-border rounded text-sm text-gray-300 px-3 py-1.5">
          <option value="">All levels</option>
          {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-surface-elevated border border-surface-border rounded text-sm text-gray-300 px-3 py-1.5">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading && alerts.length === 0 && (
        <div className="panel p-10 flex items-center justify-center text-gray-500 gap-2">
          <Loader2 size={18} className="animate-spin" /> Loading alerts…
        </div>
      )}

      {!loading && error && (
        <div className="panel p-6 flex items-center gap-3 text-status-critical">
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      {!loading && !error && alerts.length === 0 && (
        <div className="panel p-10 flex flex-col items-center justify-center text-gray-500 gap-2">
          <Inbox size={24} /> No alerts match these filters.
        </div>
      )}

      {!loading && !error && alerts.length > 0 && (
        <div className="panel overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-surface-border">
                <th className="px-4 py-3">Level</th>
                <th className="px-4 py-3">Machine</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => (
                <tr key={alert.id} className="border-b border-surface-border last:border-0 hover:bg-surface-elevated">
                  <td className="px-4 py-3"><StatusBadge status={alert.level} /></td>
                  <td className="px-4 py-3 text-gray-400">{machineName(alert.machine_id)}</td>
                  <td className="px-4 py-3">
                    <Link to={`/alerts/${alert.id}`} className="text-accent hover:underline">{alert.message}</Link>
                  </td>
                  <td className="px-4 py-3"><AlertStatusBadge status={alert.status} /></td>
                  <td className="px-4 py-3 text-gray-500">{new Date(alert.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {alert.status === "active" && (
                        <button onClick={() => handleAck(alert.id)} className="flex items-center gap-1 text-xs text-status-warning hover:underline">
                          <Check size={12} /> Ack
                        </button>
                      )}
                      {alert.status !== "resolved" && (
                        <button onClick={() => handleResolve(alert.id)} className="flex items-center gap-1 text-xs text-status-normal hover:underline">
                          <CheckCheck size={12} /> Resolve
                        </button>
                      )}
                    </div>
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