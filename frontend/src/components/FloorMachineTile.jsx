import { Link } from "react-router-dom";
import { Gauge, AlertTriangle } from "lucide-react";
import StatusBadge from "./StatusBadge";

const STATUS_GLOW = {
  normal: "border-status-normal/50 shadow-[0_0_0_1px_rgba(34,197,94,0.15)]",
  warning: "border-status-warning/50 shadow-[0_0_0_1px_rgba(245,158,11,0.15)]",
  critical: "border-status-critical/50 shadow-[0_0_0_1px_rgba(239,68,68,0.15)]",
  offline: "border-surface-border",
};

export default function FloorMachineTile({ machine, activeAlertCount }) {
  const glow = STATUS_GLOW[machine.status] || STATUS_GLOW.offline;

  return (
    <Link
      to={`/machines/${machine.id}`}
      className={`panel p-5 flex flex-col items-center gap-3 border-2 hover:scale-[1.02] transition-transform ${glow}`}
    >
      <Gauge size={28} className="text-accent" />
      <div className="text-center">
        <div className="font-medium text-gray-100">{machine.name}</div>
        <div className="text-xs text-gray-500">{machine.location || "Unassigned"}</div>
      </div>
      <StatusBadge status={machine.status} />
      <div className="flex items-center gap-1.5 text-xs text-gray-500">
        <span className={machine.connectivity === "online" ? "text-status-normal" : "text-status-offline"}>
          {machine.connectivity}
        </span>
      </div>
      {activeAlertCount > 0 && (
        <div className="flex items-center gap-1 text-xs text-status-warning">
          <AlertTriangle size={12} /> {activeAlertCount} active alert{activeAlertCount > 1 ? "s" : ""}
        </div>
      )}
    </Link>
  );
}