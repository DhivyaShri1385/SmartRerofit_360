import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import StatusBadge from "./StatusBadge";

const TREND_ICON = { up: TrendingUp, down: TrendingDown, stable: Minus };

const PARAM_LABELS = {
  vibration: "Vibration",
  temperature: "Temperature",
  current: "Current",
  voltage: "Voltage",
  rpm: "RPM",
};

export default function SensorCard({ sensor }) {
  const TrendIcon = TREND_ICON[sensor.trend] || Minus;

  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500 uppercase tracking-wide">
          {PARAM_LABELS[sensor.parameter] || sensor.parameter}
        </span>
        <StatusBadge status={sensor.status} />
      </div>

      <div className="flex items-end gap-1.5 mb-1">
        <span className="text-2xl font-semibold text-gray-100 font-mono">{sensor.value}</span>
        <span className="text-xs text-gray-500 mb-1">{sensor.unit}</span>
      </div>

      <div className="flex items-center justify-between text-[11px] text-gray-500">
        <div className="flex items-center gap-1">
          <TrendIcon size={12} />
          <span className="capitalize">{sensor.trend}</span>
        </div>
        <span>{new Date(sensor.last_updated).toLocaleTimeString()}</span>
      </div>
    </div>
  );
}