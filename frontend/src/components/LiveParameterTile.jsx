import { LineChart, Line, ResponsiveContainer } from "recharts";
import StatusBadge from "./StatusBadge";
import { AlertCircle } from "lucide-react";

const PARAM_LABELS = {
  vibration: "Vibration",
  temperature: "Temperature",
  current: "Current",
  voltage: "Voltage",
  rpm: "RPM",
};

export default function LiveParameterTile({ sensorPoint, sparklineData }) {
  const label = PARAM_LABELS[sensorPoint.parameter] || sensorPoint.parameter;

  return (
    <div className="panel p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
        {sensorPoint.is_stale ? (
          <span className="flex items-center gap-1 text-[10px] text-status-warning">
            <AlertCircle size={11} /> Stale
          </span>
        ) : (
          <StatusBadge status={sensorPoint.state} />
        )}
      </div>

      <div className="flex items-end gap-1.5 mb-2">
        <span className="text-xl font-semibold text-gray-100 font-mono">
          {sensorPoint.value ?? "—"}
        </span>
        <span className="text-xs text-gray-500 mb-0.5">{sensorPoint.unit}</span>
      </div>

      <div className="h-10">
        {sparklineData.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={sensorPoint.is_stale ? "#6b7280" : "#0ea5e9"}
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center text-[10px] text-gray-600">Waiting for data…</div>
        )}
      </div>

      <div className="text-[10px] text-gray-600 mt-1">
        {sensorPoint.last_update ? new Date(sensorPoint.last_update).toLocaleTimeString() : "No data yet"}
      </div>
    </div>
  );
}