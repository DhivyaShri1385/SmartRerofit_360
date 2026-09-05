import { Cog, Radio, Cpu, Wifi, Cloud, Monitor, ArrowRight } from "lucide-react";

const STAGES = [
  { label: "Machine", icon: Cog },
  { label: "Sensors", icon: Radio },
  { label: "Edge Controller", icon: Cpu },
  { label: "Communication", icon: Wifi },
  { label: "Cloud / Server", icon: Cloud },
  { label: "Dashboard", icon: Monitor },
];

export default function RetrofitArchitectureDiagram() {
  return (
    <div className="panel p-4">
      <h3 className="text-sm font-medium text-gray-300 mb-4">Proposed Retrofit Data Flow</h3>
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
      <p className="text-xs text-gray-500 mt-4">
        This represents the intended retrofit architecture for future hardware deployment.
        No physical edge controllers or cloud connectivity are active in the current prototype.
      </p>
    </div>
  );
}