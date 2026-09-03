import { Loader2, AlertTriangle, Inbox } from "lucide-react";
import PageHeader from "../components/PageHeader";
import MachineCard from "../components/MachineCard";
import { useMachines } from "../hooks/useMachines";

export default function Machines() {
  const { machines, loading, error, refresh } = useMachines();

  return (
    <div>
      <PageHeader
        title="Machine Management"
        description="Configured demo machines — not a record of installed physical hardware"
      />

      {loading && (
        <div className="panel p-10 flex items-center justify-center text-gray-500 gap-2">
          <Loader2 size={18} className="animate-spin" /> Loading machines…
        </div>
      )}

      {!loading && error && (
        <div className="panel p-6 flex items-center gap-3 text-status-critical">
          <AlertTriangle size={18} />
          <span>{error}</span>
          <button onClick={refresh} className="ml-auto text-xs underline">Retry</button>
        </div>
      )}

      {!loading && !error && machines.length === 0 && (
        <div className="panel p-10 flex flex-col items-center justify-center text-gray-500 gap-2">
          <Inbox size={24} />
          <span>No machines configured yet.</span>
        </div>
      )}

      {!loading && !error && machines.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {machines.map((m) => (
            <MachineCard key={m.id} machine={m} />
          ))}
        </div>
      )}
    </div>
  );
}