import { Link } from "react-router-dom";
import { Gauge, MapPin, Radio } from "lucide-react";
import StatusBadge from "./StatusBadge";

export default function MachineCard({ machine }) {
  return (
    <Link to={`/machines/${machine.id}`} className="panel p-4 hover:border-accent/50 transition-colors block">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Gauge size={18} className="text-accent" />
          <span className="font-medium text-gray-100">{machine.name}</span>
        </div>
        {machine.is_demo && <span className="demo-tag">Demo</span>}
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
        <MapPin size={12} />
        <span>{machine.location || "Unassigned"}</span>
        <span className="text-gray-700">·</span>
        <span>{machine.machine_type}</span>
      </div>

      <div className="flex items-center justify-between">
        <StatusBadge status={machine.status} />
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Radio size={12} className={machine.connectivity === "online" ? "text-status-normal" : "text-status-offline"} />
          {machine.connectivity}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-surface-border text-xs text-gray-500 flex justify-between">
        <span>{machine.sensor_count} sensors configured</span>
        <span>{machine.monitoring_enabled ? "Monitoring on" : "Monitoring off"}</span>
      </div>
    </Link>
  );
}