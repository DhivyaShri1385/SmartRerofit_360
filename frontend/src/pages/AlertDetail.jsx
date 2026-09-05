import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Loader2, AlertTriangle, ArrowLeft, Check, CheckCheck } from "lucide-react";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import AlertStatusBadge from "../components/AlertStatusBadge";
import { getAlert, acknowledgeAlert, resolveAlert } from "../services/alertService";

export default function AlertDetail() {
  const { alertId } = useParams();
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    getAlert(alertId)
      .then(setAlert)
      .catch((err) => setError(err.message || "Failed to load alert"))
      .finally(() => setLoading(false));
  };

  useEffect(load, [alertId]);

  if (loading) {
    return (
      <div className="panel p-10 flex items-center justify-center text-gray-500 gap-2">
        <Loader2 size={18} className="animate-spin" /> Loading alert…
      </div>
    );
  }

  if (error || !alert) {
    return (
      <div className="panel p-6 flex items-center gap-3 text-status-critical">
        <AlertTriangle size={18} /> {error || "Alert not found"}
      </div>
    );
  }

  return (
    <div>
      <Link to="/alerts" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 mb-4">
        <ArrowLeft size={14} /> Back to Alerts
      </Link>

      <PageHeader title="Alert Detail" description={alert.message} />

      <div className="panel p-4 space-y-3 max-w-xl">
        <Row label="Level" value={<StatusBadge status={alert.level} />} />
        <Row label="Status" value={<AlertStatusBadge status={alert.status} />} />
        <Row label="Parameter" value={alert.parameter || "—"} />
        <Row label="Value at Trigger" value={alert.value_at_trigger ?? "—"} />
        <Row label="Source" value={alert.source} />
        <Row label="Data Source" value={<span className="demo-tag">{alert.data_source}</span>} />
        <Row label="Created" value={new Date(alert.created_at).toLocaleString()} />
        <Row label="Acknowledged" value={alert.acknowledged_at ? `${new Date(alert.acknowledged_at).toLocaleString()} by ${alert.acknowledged_by || "—"}` : "Not yet"} />
        <Row label="Resolved" value={alert.resolved_at ? new Date(alert.resolved_at).toLocaleString() : "Not yet"} />

        <div className="flex gap-3 pt-3 border-t border-surface-border">
          {alert.status === "active" && (
            <button
              onClick={async () => { await acknowledgeAlert(alertId); load(); }}
              className="flex items-center gap-2 text-sm px-3 py-1.5 rounded border border-status-warning/40 text-status-warning hover:bg-status-warning/10"
            >
              <Check size={14} /> Acknowledge
            </button>
          )}
          {alert.status !== "resolved" && (
            <button
              onClick={async () => { await resolveAlert(alertId); load(); }}
              className="flex items-center gap-2 text-sm px-3 py-1.5 rounded border border-status-normal/40 text-status-normal hover:bg-status-normal/10"
            >
              <CheckCheck size={14} /> Mark Resolved
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-200">{value}</span>
    </div>
  );
}