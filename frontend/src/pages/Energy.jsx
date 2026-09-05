import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { Loader2, AlertTriangle, Zap, Clock, Activity } from "lucide-react";
import PageHeader from "../components/PageHeader";
import MachineSelector from "../components/MachineSelector";
import { useMachines } from "../hooks/useMachines";
import { getEnergyOverview, getEnergyTrend, getMachineEnergyComparison } from "../services/energyService";

const RANGE_OPTIONS = [
  { label: "Last hour", hours: 1 },
  { label: "Last shift (8h)", hours: 8 },
  { label: "Daily (24h)", hours: 24 },
  { label: "Weekly (7d)", hours: 168 },
];

export default function Energy() {
  const { machines, loading: machinesLoading } = useMachines();
  const [selectedMachineId, setSelectedMachineId] = useState(null);
  const [overview, setOverview] = useState(null);
  const [trend, setTrend] = useState([]);
  const [comparison, setComparison] = useState([]);
  const [range, setRange] = useState(RANGE_OPTIONS[0]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedMachineId && machines.length > 0) {
      const lathe = machines.find((m) => m.name === "Lathe-01");
      setSelectedMachineId(lathe ? lathe.id : machines[0].id);
    }
  }, [machines, selectedMachineId]);

  useEffect(() => {
    if (!selectedMachineId) return;
    const fetchAll = () => {
      getEnergyOverview(selectedMachineId).then(setOverview).catch((err) => setError(err.message));
      getEnergyTrend(selectedMachineId, range.hours).then(setTrend).catch(() => {});
    };
    fetchAll();
    const interval = setInterval(fetchAll, 10000);
    return () => clearInterval(interval);
  }, [selectedMachineId, range]);

  useEffect(() => {
    getMachineEnergyComparison().then(setComparison).catch(() => {});
    const interval = setInterval(() => getMachineEnergyComparison().then(setComparison).catch(() => {}), 15000);
    return () => clearInterval(interval);
  }, []);

  if (machinesLoading || (!overview && !error)) {
    return (
      <div className="panel p-10 flex items-center justify-center text-gray-500 gap-2">
        <Loader2 size={18} className="animate-spin" /> Loading energy data…
      </div>
    );
  }

  const chartData = trend.map((p) => ({
    ...p,
    time: new Date(p.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  }));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <PageHeader title="Energy Monitoring" description="Demo energy data — hardware validation pending" />
        <MachineSelector machines={machines} selectedId={selectedMachineId} onChange={setSelectedMachineId} />
      </div>

      <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded px-3 py-2">
        <Zap size={13} /> Current and voltage are currently simulated — not measured hardware values
      </div>

      {error && (
        <div className="panel p-6 flex items-center gap-3 text-status-critical mb-6">
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      {overview && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard icon={Activity} label="Current" value={overview.current_a ?? "—"} unit="A" />
          <StatCard icon={Zap} label="Voltage" value={overview.voltage_v ?? "—"} unit="V" />
          <StatCard icon={Zap} label="Estimated Power" value={overview.estimated_power_kw ?? "—"} unit="kW" />
          <StatCard icon={Clock} label="Operating Today" value={overview.operating_duration_hours} unit="hrs" />
        </div>
      )}

      {overview && (
        <div className="panel p-4 mb-6 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 mb-1">Energy Consumed Today</div>
            <div className="text-2xl font-semibold text-gray-100 font-mono">{overview.energy_today_kwh} kWh</div>
          </div>
          <span className="demo-tag">Simulated Data</span>
        </div>
      )}

      <div className="panel p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="text-sm font-medium text-gray-300">Power Trend</h3>
          <select
            value={range.label}
            onChange={(e) => setRange(RANGE_OPTIONS.find((r) => r.label === e.target.value))}
            className="bg-surface-elevated border border-surface-border rounded text-xs text-gray-300 px-2 py-1"
          >
            {RANGE_OPTIONS.map((r) => (
              <option key={r.label} value={r.label}>{r.label}</option>
            ))}
          </select>
        </div>

        {chartData.length > 1 ? (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a323d" />
              <XAxis dataKey="time" stroke="#6b7280" fontSize={11} />
              <YAxis stroke="#6b7280" fontSize={11} />
              <Tooltip contentStyle={{ background: "#161b22", border: "1px solid #2a323d", borderRadius: 6, fontSize: 12 }} />
              <Line type="monotone" dataKey="power_kw" name="Power (kW)" stroke="#0ea5e9" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-56 flex items-center justify-center text-gray-500 text-sm">
            Not enough data points yet for this time range.
          </div>
        )}
      </div>

      <div className="panel p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-4">Machine Energy Comparison (Today)</h3>
        {comparison.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={comparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a323d" />
              <XAxis dataKey="machine_name" stroke="#6b7280" fontSize={11} />
              <YAxis stroke="#6b7280" fontSize={11} />
              <Tooltip contentStyle={{ background: "#161b22", border: "1px solid #2a323d", borderRadius: 6, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="energy_today_kwh" name="Energy Today (kWh)" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-40 flex items-center justify-center text-gray-500 text-sm">No comparison data yet.</div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, unit }) {
  return (
    <div className="panel p-4">
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
        <Icon size={14} className="text-accent" /> {label}
      </div>
      <div className="flex items-end gap-1.5">
        <span className="text-xl font-semibold text-gray-100 font-mono">{value}</span>
        <span className="text-xs text-gray-500 mb-0.5">{unit}</span>
      </div>
    </div>
  );
}