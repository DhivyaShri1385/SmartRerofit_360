import { Loader2, Play } from "lucide-react";

const MODEL_LABELS = {
  isolation_forest: "Isolation Forest",
  random_forest: "Random Forest",
  xgboost: "XGBoost",
};

export default function ModelCandidateCard({ modelName, latestRun, onTrain, training }) {
  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-200">{MODEL_LABELS[modelName] || modelName}</h4>
        <span className="text-[10px] uppercase tracking-wide text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded px-1.5 py-0.5">
          Validation pending
        </span>
      </div>

      {latestRun ? (
        <div className="space-y-1.5 text-sm mb-3">
          <MetricRow label="Precision" value={latestRun.precision} />
          <MetricRow label="Recall" value={latestRun.recall} />
          <MetricRow label="F1 Score" value={latestRun.f1_score} />
          {latestRun.roc_auc !== null && <MetricRow label="ROC-AUC" value={latestRun.roc_auc} />}
          <div className="text-[11px] text-gray-600 pt-1">
            Trained on {latestRun.n_train_samples} samples · tested on {latestRun.n_test_samples}
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-500 mb-3">Not yet trained on the reference dataset.</p>
      )}

      <button
        onClick={() => onTrain(modelName)}
        disabled={training}
        className="w-full flex items-center justify-center gap-2 text-xs px-3 py-2 rounded border border-accent/40 text-accent hover:bg-accent/10 disabled:opacity-60"
      >
        {training ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
        {latestRun ? "Retrain on Reference Dataset" : "Train on Reference Dataset"}
      </button>
    </div>
  );
}

function MetricRow({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-200 font-mono">{value}</span>
    </div>
  );
}