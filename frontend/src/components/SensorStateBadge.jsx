const STATE_STYLES = {
  active: "badge-normal",
  warning: "badge-warning",
  fault: "badge-critical",
  offline: "badge-offline",
  not_configured: "badge-offline",
};

const STATE_LABELS = {
  active: "Active",
  warning: "Warning",
  fault: "Fault",
  offline: "Offline",
  not_configured: "Not Configured",
};

export default function SensorStateBadge({ state }) {
  return <span className={`badge ${STATE_STYLES[state] || "badge-offline"}`}>{STATE_LABELS[state] || state}</span>;
}