const STYLES = {
  online: "badge-normal",
  offline: "badge-offline",
  connecting: "badge-warning",
  not_registered: "badge-offline",
};

const LABELS = {
  online: "Online",
  offline: "Offline",
  connecting: "Connecting",
  not_registered: "Not Registered",
};

export default function DeviceStatusBadge({ status }) {
  return <span className={`badge ${STYLES[status] || "badge-offline"}`}>{LABELS[status] || status}</span>;
}