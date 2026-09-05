const STYLES = {
  scheduled: "bg-status-info/15 text-status-info",
  in_progress: "bg-status-warning/15 text-status-warning",
  completed: "bg-status-normal/15 text-status-normal",
  overdue: "bg-status-critical/15 text-status-critical",
};

const LABELS = {
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
  overdue: "Overdue",
};

export default function MaintenanceStatusBadge({ status }) {
  return <span className={`badge ${STYLES[status] || "badge-offline"}`}>{LABELS[status] || status}</span>;
}