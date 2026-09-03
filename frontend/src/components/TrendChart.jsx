import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const PARAM_OPTIONS = [
  { key: "vibration", label: "Vibration", color: "#0ea5e9" },
  { key: "temperature", label: "Temperature", color: "#f59e0b" },
  { key: "current", label: "Current", color: "#22c55e" },
  { key: "voltage", label: "Voltage", color: "#a855f7" },
  { key: "rpm", label: "RPM", color: "#ef4444" },
];

const TIME_RANGES = ["Last minute", "Last hour", "Last shift"];

export default function TrendChart({ trend }) {
  const [activeParams, setActiveParams] = useState(["vibration", "temperature"]);
  const [range, setRange] = useState(TIME_RANGES[1]);

  const toggleParam = (key) => {
    setActiveParams((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  const chartData = trend.map((point) => ({
    ...point,
    timestamp: new Date(point.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  }));

  return (
    <div className="panel p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap gap-1.5">
          {PARAM_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => toggleParam(opt.key)}
              className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                activeParams.includes(opt.key)
                  ? "border-accent text-accent bg-accent/10"
                  : "border-surface-border text-gray-500 hover:text-gray-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="bg-surface-elevated border border-surface-border rounded text-xs text-gray-300 px-2 py-1"
        >
          {TIME_RANGES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a323d" />
          <XAxis dataKey="timestamp" stroke="#6b7280" fontSize={11} />
          <YAxis stroke="#6b7280" fontSize={11} />
          <Tooltip
            contentStyle={{ background: "#161b22", border: "1px solid #2a323d", borderRadius: 6, fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {PARAM_OPTIONS.filter((opt) => activeParams.includes(opt.key)).map((opt) => (
            <Line
              key={opt.key}
              type="monotone"
              dataKey={opt.key}
              name={opt.label}
              stroke={opt.color}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}