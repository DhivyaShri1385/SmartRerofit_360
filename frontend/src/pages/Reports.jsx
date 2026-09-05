import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Loader2, AlertTriangle, Download, FileBarChart } from "lucide-react";
import PageHeader from "../components/PageHeader";
import MachineSelector from "../components/MachineSelector";
import { useMachines } from "../hooks/useMachines";
import { getReport, getCsvExportUrl } from "../services/reportsService";

export default function Reports() {
  const { machines } = useMachines();
  const [machineId, setMachineId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const filters = {
    ...(machineId && { machine_id: machineId }),
    ...(dateFrom && { date_from: new Date(dateFrom).toISOString() }),
    ...(dateTo && { date_to: new Date(dateTo).toISOString() }),
  };

  const load = () => {
    setLoading(true);
    getReport(filters)
      .then(setReport)
      .catch((err) => setError(err.message || "Failed to load report"))
      .finally(() => setLoading(false));
  };

  useEffect(load, [machineId, dateFrom, dateTo]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <PageHeader title="Reports & Analytics" description="Based on simulated/demo data" />
        <a
          href={getCsvExportUrl(filters)}
          className="flex items-center gap-2 text-sm px-3 py-2 rounded border border-accent/40 text-accent hover:bg-accent/10"
        >
          <Download size={14} /> Export CSV
        </a>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <MachineSelector machines={[{ id: "", name: "All machines" }, ...machines]} selectedId={machineId} onChange={setMachineId} />
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="bg-surface-elevated border border-surface-border rounded text-sm text-gray-300 px-3 py-1.5" />
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="bg-surface-elevated border border-surface-border rounded text-sm text-gray-300 px-3 py-1.5" />
      </div>

      {loading && (
        <div className="panel p-10 flex items-center justify-center text-gray-500 gap-2">
          <Loader2 size={18} className="animate-spin" /> Generating report…
        </div>
      )}

      {!loading && error && (
        <div className="panel p-6 flex items-center gap-3 text-status-critical">
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      {!loading && report && (
        <div className="space-y-6">
          <ReportSection title="Machine Performance">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-surface-border">
                  <th className="px-3 py-2">Machine</th>
                  <th className="px-3 py-2">Uptime %</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Alerts</th>
                  <th className="px-3 py-2">Maintenance Events</th>
                </tr>
              </thead>
              <tbody>
                {report.machine_performance.map((row) => (
                  <tr key={row.machine_id} className="border-b border-surface-border last:border-0">
                    <td className="px-3 py-2 text-gray-300">{row.machine_name}</td>
                    <td className="px-3 py-2 text-gray-400">{row.uptime_pct}%</td>
                    <td className="px-3 py-2 text-gray-400 capitalize">{row.avg_health_status}</td>
                    <td className="px-3 py-2 text-gray-400">{row.total_alerts}</td>
                    <td className="px-3 py-2 text-gray-400">{row.total_maintenance_events}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ReportSection>

          <ReportSection title="Sensor Trends">
            {report.sensor_trends.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={report.sensor_trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a323d" />
                  <XAxis dataKey="parameter" stroke="#6b7280" fontSize={11} />
                  <YAxis stroke="#6b7280" fontSize={11} />
                  <Tooltip contentStyle={{ background: "#161b22", border: "1px solid #2a323d", borderRadius: 6, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="avg_value" name="Average" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyNote text="No sensor readings in this range yet." />
            )}
          </ReportSection>

          <ReportSection title="Alert Breakdown">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={report.alert_breakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a323d" />
                <XAxis dataKey="level" stroke="#6b7280" fontSize={11} />
                <YAxis stroke="#6b7280" fontSize={11} />
                <Tooltip contentStyle={{ background: "#161b22", border: "1px solid #2a323d", borderRadius: 6, fontSize: 12 }} />
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ReportSection>

          <ReportSection title="Maintenance Breakdown">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-surface-border">
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Total</th>
                  <th className="px-3 py-2">Completed</th>
                </tr>
              </thead>
              <tbody>
                {report.maintenance_breakdown.map((row) => (
                  <tr key={row.maintenance_type} className="border-b border-surface-border last:border-0">
                    <td className="px-3 py-2 text-gray-300 capitalize">{row.maintenance_type.replace("_", " ")}</td>
                    <td className="px-3 py-2 text-gray-400">{row.count}</td>
                    <td className="px-3 py-2 text-gray-400">{row.completed_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ReportSection>
        </div>
      )}
    </div>
  );
}

function ReportSection({ title, children }) {
  return (
    <div className="panel p-4">
      <div className="flex items-center gap-2 mb-3">
        <FileBarChart size={16} className="text-accent" />
        <h3 className="text-sm font-medium text-gray-300">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function EmptyNote({ text }) {
  return <div className="text-sm text-gray-500 text-center py-6">{text}</div>;
}