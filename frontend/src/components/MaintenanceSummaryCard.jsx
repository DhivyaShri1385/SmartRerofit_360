import { HeartPulse, AlertCircle, Wrench, Calendar, History } from "lucide-react";

export default function MaintenanceSummaryCard({ maintenance }) {
  return (
    <div className="panel p-4">
      <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
        <HeartPulse size={16} className="text-accent" /> Maintenance Summary
      </h3>
      <div className="space-y-2.5 text-sm">
        <Row icon={HeartPulse} label="Health Status" value={maintenance.health_status} />
        <Row icon={AlertCircle} label="Active Anomaly" value={maintenance.active_anomaly || "None detected"} />
        <Row icon={Wrench} label="Suggested Inspection" value={maintenance.suggested_inspection || "Not required"} />
        <Row icon={Calendar} label="Next Maintenance" value={maintenance.next_maintenance} />
        <Row icon={History} label="Recent Event" value={maintenance.recent_event} />
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <Icon size={14} className="text-gray-600 mt-0.5 shrink-0" />
      <div className="flex-1 flex justify-between gap-2">
        <span className="text-gray-500">{label}</span>
        <span className="text-gray-300 text-right">{value}</span>
      </div>
    </div>
  );
}