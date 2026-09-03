const STATUS_STYLES = {
  normal: "badge-normal",
  warning: "badge-warning",
  critical: "badge-critical",
  offline: "badge-offline",
  online: "badge-normal",
  information: "badge-info",
};

export default function StatusBadge({ status }) {
  const cls = STATUS_STYLES[status] || "badge-offline";
  return <span className={`badge ${cls}`}>{status}</span>;
}