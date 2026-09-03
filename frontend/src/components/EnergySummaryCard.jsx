import { Zap, TrendingUp, TrendingDown } from "lucide-react";

export default function EnergySummaryCard({ energy }) {
  const trendUp = energy.weekly_trend_pct >= 0;
  return (
    <div className="panel p-4">
      <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
        <Zap size={16} className="text-accent" /> Energy Summary
      </h3>
      <div className="space-y-2.5 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Current Power</span>
          <span className="text-gray-200 font-mono">{energy.current_power_kw} kW</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Daily Energy</span>
          <span className="text-gray-200 font-mono">{energy.daily_energy_kwh} kWh</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Weekly Trend</span>
          <span className={`flex items-center gap-1 font-mono ${trendUp ? "text-status-warning" : "text-status-normal"}`}>
            {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(energy.weekly_trend_pct)}%
          </span>
        </div>
      </div>
    </div>
  );
}