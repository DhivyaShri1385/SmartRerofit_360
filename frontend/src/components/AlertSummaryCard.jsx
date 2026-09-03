import { Info, AlertTriangle, ShieldAlert } from "lucide-react";

export default function AlertSummaryCard({ alerts }) {
  return (
    <div className="panel p-4">
      <h3 className="text-sm font-medium text-gray-300 mb-3">Alert Summary</h3>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-status-info/10 rounded p-3">
          <Info size={16} className="text-status-info mx-auto mb-1" />
          <div className="text-lg font-semibold text-status-info">{alerts.information}</div>
          <div className="text-[10px] text-gray-500">Info</div>
        </div>
        <div className="bg-status-warning/10 rounded p-3">
          <AlertTriangle size={16} className="text-status-warning mx-auto mb-1" />
          <div className="text-lg font-semibold text-status-warning">{alerts.warning}</div>
          <div className="text-[10px] text-gray-500">Warning</div>
        </div>
        <div className="bg-status-critical/10 rounded p-3">
          <ShieldAlert size={16} className="text-status-critical mx-auto mb-1" />
          <div className="text-lg font-semibold text-status-critical">{alerts.critical}</div>
          <div className="text-[10px] text-gray-500">Critical</div>
        </div>
      </div>
    </div>
  );
}