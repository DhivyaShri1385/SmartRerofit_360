import { useState, useEffect } from "react";
import { Loader2, AlertTriangle, HeartPulse, Database, ShieldAlert } from "lucide-react";
import PageHeader from "../components/PageHeader";
import MachineSelector from "../components/MachineSelector";
import StatusBadge from "../components/StatusBadge";
import DataPipelineDiagram from "../components/DataPipelineDiagram";
import ModelCandidateCard from "../components/ModelCandidateCard";
import { useMachines } from "../hooks/useMachines";
import { getMachineHealth, getRecommendations } from "../services/predictiveMaintenanceService";
import { getDatasetSummary, trainModel, getModelRuns } from "../services/analyticsService";

const CANDIDATE_MODELS = ["isolation_forest", "random_forest", "xgboost"];

export default function PredictiveMaintenance() {
  const { machines, loading: machinesLoading } = useMachines();
  const [selectedMachineId, setSelectedMachineId] = useState(null);

  const [health, setHealth] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [datasetSummary, setDatasetSummary] = useState(null);
  const [datasetError, setDatasetError] = useState(null);
  const [modelRuns, setModelRuns] = useState({});
  const [trainingModel, setTrainingModel] = useState(null);
  const [trainError, setTrainError] = useState(null);

  useEffect(() => {
    if (!selectedMachineId && machines.length > 0) {
      const lathe = machines.find((m) => m.name === "Lathe-01");
      setSelectedMachineId(lathe ? lathe.id : machines[0].id);
    }
  }, [machines, selectedMachineId]);

  useEffect(() => {
    if (!selectedMachineId) return;
    getMachineHealth(selectedMachineId).then(setHealth).catch(() => {});
    getRecommendations(selectedMachineId).then(setRecommendations).catch(() => {});
  }, [selectedMachineId]);

  useEffect(() => {
    getDatasetSummary()
      .then(setDatasetSummary)
      .catch((err) => setDatasetError(err.message || "Reference dataset not found. Run the importer script first."));
    refreshModelRuns();
  }, []);

  const refreshModelRuns = async () => {
    try {
      const runs = await getModelRuns();
      const latestByModel = {};
      for (const run of runs) {
        if (!latestByModel[run.model_name] || run.trained_at > latestByModel[run.model_name].trained_at) {
          latestByModel[run.model_name] = run;
        }
      }
      setModelRuns(latestByModel);
    } catch {
      // Non-fatal — model list is optional supplementary info
    }
  };

  const handleTrain = async (modelName) => {
    setTrainingModel(modelName);
    setTrainError(null);
    try {
      await trainModel(modelName);
      await refreshModelRuns();
    } catch (err) {
      setTrainError(err.message || `Failed to train ${modelName}`);
    } finally {
      setTrainingModel(null);
    }
  };

  if (machinesLoading) {
    return (
      <div className="panel p-10 flex items-center justify-center text-gray-500 gap-2">
        <Loader2 size={18} className="animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <PageHeader
          title="Predictive Maintenance"
          description="Prototype — model validation pending hardware data collection"
        />
        <MachineSelector machines={machines} selectedId={selectedMachineId} onChange={setSelectedMachineId} />
      </div>

      {/* Machine Health + Anomaly Panel */}
      {health && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="panel p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
              <HeartPulse size={16} className="text-accent" /> Machine Health
            </h3>
            <div className="space-y-2 text-sm">
              <Row label="Current Condition" value={<StatusBadge status={health.condition} />} />
              <Row label="Health Indicator" value={health.health_indicator} />
              <Row label="Trend" value={health.trend} />
            </div>
          </div>

          <div className="panel p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
              <ShieldAlert size={16} className="text-accent" /> Anomaly Panel
            </h3>
            <div className="flex items-center gap-3">
              <StatusBadge status={health.anomaly_status} />
              <span className="text-xs text-gray-500">
                Derived from live simulated sensor thresholds — not an ML anomaly score.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Data pipeline visualization */}
      <div className="mb-6">
        <DataPipelineDiagram />
      </div>

      {/* Recommendations */}
      <div className="panel p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-300">Maintenance Recommendations</h3>
          <span className="demo-tag">Demo Rule-Based</span>
        </div>
        <div className="space-y-2">
          {recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-3 bg-surface-elevated rounded p-3">
              <UrgencyDot urgency={rec.urgency} />
              <div>
                <div className="text-sm text-gray-200">{rec.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">{rec.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dataset summary */}
      <div className="panel p-4 mb-6">
        <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
          <Database size={16} className="text-accent" /> Reference Dataset
        </h3>
        {datasetError && (
          <div className="flex items-center gap-2 text-status-critical text-sm">
            <AlertTriangle size={16} /> {datasetError}
          </div>
        )}
        {datasetSummary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <Stat label="Total Records" value={datasetSummary.total_records.toLocaleString()} />
            <Stat label="Machine Types" value={datasetSummary.machine_types.join(", ")} />
            <Stat label="Failure Rate" value={`${datasetSummary.failure_rate_pct}%`} />
            <Stat label="Synthetic Dataset" value={datasetSummary.is_synthetic ? "Yes" : "No"} />
          </div>
        )}
        <p className="text-xs text-gray-500 mt-3">
          This is an external/synthetic reference dataset used to prototype the ML pipeline —
          it is structurally similar to expected sensor output but was not collected from Lathe-01 hardware.
        </p>
      </div>

      {/* Candidate models */}
      <h3 className="text-sm font-medium text-gray-300 mb-3">Candidate Models — Validation Pending</h3>
      {trainError && (
        <div className="flex items-center gap-2 text-status-critical text-sm mb-3">
          <AlertTriangle size={16} /> {trainError}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {CANDIDATE_MODELS.map((modelName) => (
          <ModelCandidateCard
            key={modelName}
            modelName={modelName}
            latestRun={modelRuns[modelName]}
            onTrain={handleTrain}
            training={trainingModel === modelName}
          />
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

function Stat({ label, value }) {
  return (
    <div>
      <div className="text-[11px] text-gray-500 mb-0.5">{label}</div>
      <div className="text-gray-200">{value}</div>
    </div>
  );
}

function UrgencyDot({ urgency }) {
  const color = urgency === "high" ? "bg-status-critical" : urgency === "medium" ? "bg-status-warning" : "bg-status-normal";
  return <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${color}`} />;
}