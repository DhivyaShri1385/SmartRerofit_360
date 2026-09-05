const STYLES = {
  active: "bg-status-critical/15 text-status-critical",
  acknowledged: "bg-status-warning/15 text-status-warning",
  resolved: "bg-status-normal/15 text-status-normal",
};

export default function AlertStatusBadge({ status }) {
  return <span className={`badge ${STYLES[status] || "badge-offline"}`}>{status}</span>;
}