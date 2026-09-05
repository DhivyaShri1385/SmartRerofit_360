import { Database, Filter, Layers, ScanSearch, ClipboardCheck, ArrowRight } from "lucide-react";

const STAGES = [
  { label: "Sensor Data", icon: Database },
  { label: "Preprocessing", icon: Filter },
  { label: "Feature Extraction", icon: Layers },
  { label: "Anomaly Detection", icon: ScanSearch },
  { label: "Maintenance Decision", icon: ClipboardCheck },
];

export default function DataPipelineDiagram() {
  return (
    <div className="panel p-4">
      <h3 className="text-sm font-medium text-gray-300 mb-4">Predictive Maintenance Pipeline</h3>
      <div className="flex flex-wrap items-center gap-2">
        {STAGES.map((stage, i) => {
          const Icon = stage.icon;
          return (
            <div key={stage.label} className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-1.5 bg-surface-elevated border border-surface-border rounded px-3 py-3 w-28">
                <Icon size={18} className="text-accent" />
                <span className="text-[11px] text-gray-300 text-center leading-tight">{stage.label}</span>
              </div>
              {i < STAGES.length - 1 && <ArrowRight size={16} className="text-gray-600 shrink-0" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}