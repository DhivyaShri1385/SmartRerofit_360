import { useState, useEffect } from "react";
import { Loader2, AlertTriangle, Inbox, Plus, CalendarClock, AlertOctagon, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import MaintenanceStatusBadge from "../components/MaintenanceStatusBadge";
import MaintenanceFormModal from "../components/MaintenanceFormModal";
import { useMachines } from "../hooks/useMachines";
import { getMaintenanceRecords, getMaintenanceOverview } from "../services/maintenanceService";

export default function Maintenance() {
  const { machines } = useMachines();
  const [records, setRecords] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const machineName = (id) => machines.find((m) => m.id === id)?.name || "Unknown";

  const load = () => {
    setLoading(true);
    Promise.all([
      getMaintenanceRecords(search ? { search } : {}),
      getMaintenanceOverview(),
    ])
      .then(([recs, ov]) => { setRecords(recs); setOverview(ov); })
      .catch((err) => setError(err.message || "Failed to load maintenance data"))
      .finally(() => setLoading(false));
  };

  useEffect(load, [search]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <PageHeader title="Maintenance Management" />
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-sm px-3 py-2 rounded bg-accent hover:bg-accent-muted text-white"
        >
          <Plus size={14} /> New Record
        </button>
      </div>

      {overview && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <OverviewCard icon={CalendarClock} label="Upcoming" value={overview.upcoming_count} color="text-status-info" />
          <OverviewCard icon={AlertOctagon} label="Overdue" value={overview.overdue_count} color="text-status-critical" />
          <OverviewCard icon={CheckCircle2} label="Completed This Month" value={overview.completed_this_month} color="text-status-normal" />
        </div>
      )}

      <div className="mb-4">
        <input
          placeholder="Search maintenance records…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-80 bg-surface-elevated border border-surface-border rounded px-3 py-2 text-sm text-gray-100"
        />
      </div>

      {loading && (
        <div className="panel p-10 flex items-center justify-center text-gray-500 gap-2">
          <Loader2 size={18} className="animate-spin" /> Loading records…
        </div>
      )}

      {!loading && error && (
        <div className="panel p-6 flex items-center gap-3 text-status-critical">
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      {!loading && !error && records.length === 0 && (
        <div className="panel p-10 flex flex-col items-center justify-center text-gray-500 gap-2">
          <Inbox size={24} /> No maintenance records yet.
        </div>
      )}

      {!loading && !error && records.length > 0 && (
        <div className="panel overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-surface-border">
                <th className="px-4 py-3">Machine</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Scheduled</th>
                <th className="px-4 py-3">Source</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b border-surface-border last:border-0 hover:bg-surface-elevated">
                  <td className="px-4 py-3 text-gray-400">{machineName(r.machine_id)}</td>
                  <td className="px-4 py-3 text-gray-400 capitalize">{r.maintenance_type.replace("_", " ")}</td>
                  <td className="px-4 py-3">
                    <Link to={`/maintenance/${r.id}`} className="text-accent hover:underline">{r.description}</Link>
                  </td>
                  <td className="px-4 py-3"><MaintenanceStatusBadge status={r.status} /></td>
                  <td className="px-4 py-3 text-gray-500">{r.scheduled_date ? new Date(r.scheduled_date).toLocaleString() : "—"}</td>
                  <td className="px-4 py-3">
                    {r.source === "predictive_suggested" ? (
                      <span className="demo-tag">Predictive Suggested</span>
                    ) : (
                      <span className="text-xs text-gray-500">Manual</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <MaintenanceFormModal
          machines={machines}
          onClose={() => setShowForm(false)}
          onCreated={load}
        />
      )}
    </div>
  );
}

function OverviewCard({ icon: Icon, label, value, color }) {
  return (
    <div className="panel p-4 flex items-center gap-3">
      <Icon size={20} className={color} />
      <div>
        <div className="text-xl font-semibold text-gray-100">{value}</div>
        <div className="text-xs text-gray-500">{label}</div>
      </div>
    </div>
  );
}