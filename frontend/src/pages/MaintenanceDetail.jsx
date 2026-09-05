import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Loader2, AlertTriangle, ArrowLeft, CheckCircle2 } from "lucide-react";
import PageHeader from "../components/PageHeader";
import MaintenanceStatusBadge from "../components/MaintenanceStatusBadge";
import { getMaintenanceRecord, updateMaintenanceRecord } from "../services/maintenanceService";

export default function MaintenanceDetail() {
  const { recordId } = useParams();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    getMaintenanceRecord(recordId)
      .then(setRecord)
      .catch((err) => setError(err.message || "Failed to load record"))
      .finally(() => setLoading(false));
  };

  useEffect(load, [recordId]);

  const handleComplete = async () => {
    await updateMaintenanceRecord(recordId, { is_completed: true });
    load();
  };

  if (loading) {
    return (
      <div className="panel p-10 flex items-center justify-center text-gray-500 gap-2">
        <Loader2 size={18} className="animate-spin" /> Loading record…
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="panel p-6 flex items-center gap-3 text-status-critical">
        <AlertTriangle size={18} /> {error || "Record not found"}
      </div>
    );
  }

  return (
    <div>
      <Link to="/maintenance" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 mb-4">
        <ArrowLeft size={14} /> Back to Maintenance
      </Link>

      <PageHeader title={record.description} description={`${record.maintenance_type.replace("_", " ")} maintenance`} />

      <div className="panel p-4 space-y-3 max-w-xl">
        <Row label="Status" value={<MaintenanceStatusBadge status={record.status} />} />
        <Row label="Performed By" value={record.performed_by || "—"} />
        <Row label="Parts Used" value={record.parts_used || "—"} />
        <Row label="Scheduled Date" value={record.scheduled_date ? new Date(record.scheduled_date).toLocaleString() : "—"} />
        <Row label="Completed Date" value={record.completed_date ? new Date(record.completed_date).toLocaleString() : "Not completed"} />
        <Row label="Source" value={record.source === "predictive_suggested" ? <span className="demo-tag">Predictive Suggested</span> : "Manual"} />
        <Row label="Notes" value={record.notes || "—"} />

        {!record.is_completed && (
          <button
            onClick={handleComplete}
            className="flex items-center gap-2 text-sm px-3 py-1.5 rounded border border-status-normal/40 text-status-normal hover:bg-status-normal/10"
          >
            <CheckCircle2 size={14} /> Mark Completed
          </button>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between text-sm gap-4">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="text-gray-200 text-right">{value}</span>
    </div>
  );
}