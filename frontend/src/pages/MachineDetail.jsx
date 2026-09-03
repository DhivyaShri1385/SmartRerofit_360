import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Loader2, AlertTriangle, ArrowLeft, Activity, Radio, Brain, Zap, Bell, Wrench } from "lucide-react";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { getMachine } from "../services/machineService";

const RELATED_LINKS = [
  { label: "Live Monitoring", path: "/live-monitoring", icon: Activity },
  { label: "Sensors", path: "/sensors", icon: Radio },
  { label: "Predictive Maintenance", path: "/predictive-maintenance", icon: Brain },
  { label: "Energy", path: "/energy", icon: Zap },
  { label: "Alerts", path: "/alerts", icon: Bell },
  { label: "Maintenance", path: "/maintenance", icon: Wrench },
];

export default function MachineDetail() {
  const { machineId } = useParams();
  const [machine, setMachine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getMachine(machineId)
      .then((data) => mounted && setMachine(data))
      .catch((err) => mounted && setError(err.message || "Failed to load machine"))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [machineId]);

  if (loading) {
    return (
      <div className="panel p-10 flex items-center justify-center text-gray-500 gap-2">
        <Loader2 size={18} className="animate-spin" /> Loading machine…
      </div>
    );
  }

  if (error || !machine) {
    return (
      <div className="panel p-6 flex items-center gap-3 text-status-critical">
        <AlertTriangle size={18} />
        <span>{error || "Machine not found"}</span>
      </div>
    );
  }

  return (
    <div>
      <Link to="/machines" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 mb-4">
        <ArrowLeft size={14} /> Back to Machines
      </Link>

      <PageHeader title={machine.name} description={`${machine.machine_type} · ${machine.location || "Unassigned"}`} />

      {machine.is_demo && (
        <div className="mb-4 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded px-3 py-2">
          This is a demo/configuration entry for software development. It does not represent installed physical hardware.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="panel p-4 space-y-2 text-sm">
          <Row label="Status" value={<StatusBadge status={machine.status} />} />
          <Row label="Connectivity" value={<StatusBadge status={machine.connectivity} />} />
          <Row label="Maintenance Status" value={machine.maintenance_status.replace("_", " ")} />
          <Row label="Monitoring" value={machine.monitoring_enabled ? "Enabled" : "Disabled"} />
        </div>
        <div className="panel p-4 space-y-2 text-sm">
          <Row label="Sensor Count" value={`${machine.sensor_count} configured`} />
          <Row label="Installed On" value={new Date(machine.installed_on).toLocaleDateString()} />
          <Row
            label="Last Communication"
            value={machine.last_communication ? new Date(machine.last_communication).toLocaleString() : "No data yet"}
          />
        </div>
      </div>

      <h2 className="text-sm font-medium text-gray-400 mb-3">Related Modules</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {RELATED_LINKS.map(({ label, path, icon: Icon }) => (
          <Link key={path} to={path} className="panel p-4 flex items-center gap-2 hover:border-accent/50 transition-colors">
            <Icon size={16} className="text-accent" />
            <span className="text-sm text-gray-300">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-200">{value}</span>
    </div>
  );
}