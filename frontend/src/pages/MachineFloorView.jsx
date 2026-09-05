import { useState, useEffect } from "react";
import { Loader2, LayoutGrid } from "lucide-react";
import PageHeader from "../components/PageHeader";
import FloorMachineTile from "../components/FloorMachineTile";
import RetrofitArchitectureDiagram from "../components/RetrofitArchitectureDiagram";
import { useMachines } from "../hooks/useMachines";
import { getAlertSummary } from "../services/alertService";

export default function MachineFloorView() {
  const { machines, loading } = useMachines();
  const [alertCounts, setAlertCounts] = useState({});

  useEffect(() => {
    if (machines.length === 0) return;
    const fetchCounts = () => {
      Promise.all(
        machines.map((m) => getAlertSummary(m.id).then((s) => [m.id, s.total_active]).catch(() => [m.id, 0]))
      ).then((results) => setAlertCounts(Object.fromEntries(results)));
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 10000);
    return () => clearInterval(interval);
  }, [machines]);

  return (
    <div>
      <PageHeader
        title="Proposed Machine-Floor Monitoring"
        description="Conceptual layout for demonstration — not a record of an installed factory floor"
      />

      <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded px-3 py-2">
        <LayoutGrid size={13} /> Demo layout — for project demonstration purposes only
      </div>

      {loading ? (
        <div className="panel p-10 flex items-center justify-center text-gray-500 gap-2">
          <Loader2 size={18} className="animate-spin" /> Loading floor layout…
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {machines.map((machine) => (
            <FloorMachineTile
              key={machine.id}
              machine={machine}
              activeAlertCount={alertCounts[machine.id] || 0}
            />
          ))}
        </div>
      )}

      <RetrofitArchitectureDiagram />
    </div>
  );
}