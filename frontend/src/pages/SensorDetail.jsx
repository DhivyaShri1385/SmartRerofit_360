import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Loader2, AlertTriangle, ArrowLeft, Save, ClockAlert } from "lucide-react";
import PageHeader from "../components/PageHeader";
import SensorStateBadge from "../components/SensorStateBadge";
import { getSensor, updateThresholds, toggleSampling } from "../services/sensorService";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useSensorHistory } from "../hooks/useSensorHistory";

const PARAM_LABELS = {
  vibration: "Vibration",
  temperature: "Temperature",
  current: "Current",
  voltage: "Voltage",
  rpm: "RPM",
};
export default function SensorDetail() {
  const { sensorId } = useParams();
  const { history, loading: historyLoading } = useSensorHistory(sensorId);
  const [sensor, setSensor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [thresholdForm, setThresholdForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [togglingSampling, setTogglingSampling] = useState(false);
  const [toggleError, setToggleError] = useState(null);

  const load = () => {
    setLoading(true);
    getSensor(sensorId)
      .then((data) => {
        setSensor(data);
        setThresholdForm({
          warning_min: data.warning_min ?? "",
          warning_max: data.warning_max ?? "",
          critical_min: data.critical_min ?? "",
          critical_max: data.critical_max ?? "",
        });
      })
      .catch((err) => setError(err.message || "Failed to load sensor"))
      .finally(() => setLoading(false));
  };

  useEffect(load, [sensorId]);

  const handleSaveThresholds = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      const payload = Object.fromEntries(
        Object.entries(thresholdForm).map(([k, v]) => [k, v === "" ? null : parseFloat(v)])
      );
      const updated = await updateThresholds(sensorId, payload);
      setSensor(updated);
      setSaveMessage({ type: "success", text: "Thresholds updated" });
    } catch (err) {
      setSaveMessage({ type: "error", text: err.message || "Failed to save thresholds" });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleSampling = async () => {
    setTogglingSampling(true);
    setToggleError(null);
    try {
      const updated = await toggleSampling(sensorId, !sensor.sampling_enabled);
      setSensor(updated);
    } catch (err) {
      setToggleError(err.message || "Failed to update sampling state. Check that you're logged in as Admin or Engineer.");
    } finally {
      setTogglingSampling(false);
    }
  };

  if (loading) {
    return (
      <div className="panel p-10 flex items-center justify-center text-gray-500 gap-2">
        <Loader2 size={18} className="animate-spin" /> Loading sensor…
      </div>
    );
  }

  if (error || !sensor) {
    return (
      <div className="panel p-6 flex items-center gap-3 text-status-critical">
        <AlertTriangle size={18} /> {error || "Sensor not found"}
      </div>
    );
  }

  return (
    <div>
      <Link to="/sensors" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 mb-4">
        <ArrowLeft size={14} /> Back to Sensors
      </Link>

      <PageHeader
        title={`${PARAM_LABELS[sensor.sensor_type] || sensor.sensor_type} Sensor`}
        description={`Unit: ${sensor.unit} · Prototype software — simulated sensor input`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Metadata + historical graph placeholder */}
        <div className="panel p-4">
  <div className="flex items-center justify-between mb-3">
    <h3 className="text-sm font-medium text-gray-300">Historical Trend</h3>
    <span className="demo-tag">Simulated Data</span>
  </div>

  {historyLoading && history.length === 0 && (
    <div className="h-56 flex items-center justify-center text-gray-500 text-sm gap-2">
      <Loader2 size={16} className="animate-spin" /> Loading readings…
    </div>
  )}

  {!historyLoading && history.length === 0 && (
    <div className="h-56 flex flex-col items-center justify-center text-gray-600 gap-2 border border-dashed border-surface-border rounded">
      <ClockAlert size={22} />
      <span className="text-xs text-center px-6">
        {sensor.sampling_enabled
          ? "Sampling is enabled — the first simulated readings will appear within a few seconds."
          : "No historical readings yet. Enable sampling to start the simulated data stream."}
      </span>
    </div>
  )}

  {history.length > 0 && (
    <ResponsiveContainer width="100%" height={224}>
      <LineChart data={history.map((r) => ({
        ...r,
        time: new Date(r.recorded_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      }))}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a323d" />
        <XAxis dataKey="time" stroke="#6b7280" fontSize={10} />
        <YAxis stroke="#6b7280" fontSize={10} domain={["auto", "auto"]} />
        <Tooltip contentStyle={{ background: "#161b22", border: "1px solid #2a323d", borderRadius: 6, fontSize: 12 }} />
        <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  )}
</div>

        {/* State + config */}
        <div className="panel p-4 space-y-3">
          <h3 className="text-sm font-medium text-gray-300 mb-1">Sensor State</h3>
          <Row label="Current State" value={<SensorStateBadge state={sensor.state} />} />
          <Row label="Sampling" value={sensor.sampling_enabled ? "Enabled" : "Disabled"} />
          <Row label="Last Update" value={sensor.last_update ? new Date(sensor.last_update).toLocaleString() : "No data yet"} />

          <button
            onClick={handleToggleSampling}
            disabled={togglingSampling}
            className={`mt-2 w-full text-sm py-2 rounded border transition-colors flex items-center justify-center gap-2 disabled:opacity-60 ${
              sensor.sampling_enabled
                ? "border-status-critical/40 text-status-critical hover:bg-status-critical/10"
                : "border-status-normal/40 text-status-normal hover:bg-status-normal/10"
            }`}
          >
            {togglingSampling && <Loader2 size={14} className="animate-spin" />}
            {sensor.sampling_enabled ? "Disable Sampling" : "Enable Sampling"}
          </button>

          {toggleError && (
            <div className="flex items-center gap-2 text-status-critical text-xs">
              <AlertTriangle size={14} /> {toggleError}
            </div>
          )}
        </div>
      </div>

      {/* Threshold configuration */}
      <div className="panel p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-1">Threshold Configuration</h3>
        <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded px-3 py-2 mb-4">
          These are configuration values you set, not experimentally validated safety limits.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <ThresholdInput
            label="Warning Min"
            value={thresholdForm.warning_min}
            onChange={(v) => setThresholdForm((f) => ({ ...f, warning_min: v }))}
          />
          <ThresholdInput
            label="Warning Max"
            value={thresholdForm.warning_max}
            onChange={(v) => setThresholdForm((f) => ({ ...f, warning_max: v }))}
          />
          <ThresholdInput
            label="Critical Min"
            value={thresholdForm.critical_min}
            onChange={(v) => setThresholdForm((f) => ({ ...f, critical_min: v }))}
          />
          <ThresholdInput
            label="Critical Max"
            value={thresholdForm.critical_max}
            onChange={(v) => setThresholdForm((f) => ({ ...f, critical_max: v }))}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveThresholds}
            disabled={saving}
            className="flex items-center gap-2 bg-accent hover:bg-accent-muted transition-colors text-white text-sm px-4 py-2 rounded disabled:opacity-60"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save Thresholds
          </button>
          {saveMessage && (
            <span className={`text-xs ${saveMessage.type === "success" ? "text-status-normal" : "text-status-critical"}`}>
              {saveMessage.text}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-200">{value}</span>
    </div>
  );
}

function ThresholdInput({ label, value, onChange }) {
  return (
    <div>
      <label className="text-[11px] text-gray-500 block mb-1">{label}</label>
      <input
        type="number"
        step="0.1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-surface-elevated border border-surface-border rounded px-2 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-accent"
      />
    </div>
  );
}