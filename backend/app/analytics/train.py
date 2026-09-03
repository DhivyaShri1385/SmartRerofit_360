"""
Predictive-maintenance model training/evaluation.
Runs ONLY against ml_training_records (external reference dataset).

Metrics produced here describe model behavior on that reference data —
NOT a claim about performance on real Lathe-01 hardware.
"""
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix,
)

from app.analytics.preprocessing import load_dataframe, FEATURE_COLUMNS, TARGET_COLUMN

try:
    from xgboost import XGBClassifier
    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False

SUPPORTED_MODELS = ["random_forest", "isolation_forest", "xgboost"]


def train_and_evaluate(db, dataset_version: str, model_name: str) -> dict:
    if model_name not in SUPPORTED_MODELS:
        raise ValueError(f"Unsupported model '{model_name}'. Choose from {SUPPORTED_MODELS}")

    df = load_dataframe(db, dataset_version)
    if df.empty:
        return {"error": "Insufficient validated data for model evaluation."}

    if model_name == "xgboost" and not XGBOOST_AVAILABLE:
        return {"error": "xgboost is not installed on the server. Run: pip install xgboost"}

    X = df[FEATURE_COLUMNS]
    y = df[TARGET_COLUMN]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    if model_name == "random_forest":
        model = RandomForestClassifier(n_estimators=200, max_depth=8, random_state=42)
        model.fit(X_train_scaled, y_train)
        y_pred = model.predict(X_test_scaled)
        y_proba = model.predict_proba(X_test_scaled)[:, 1]

    elif model_name == "xgboost":
        model = XGBClassifier(
            n_estimators=200, max_depth=5, learning_rate=0.1,
            eval_metric="logloss", random_state=42,
        )
        model.fit(X_train_scaled, y_train)
        y_pred = model.predict(X_test_scaled)
        y_proba = model.predict_proba(X_test_scaled)[:, 1]

    else:  # isolation_forest — unsupervised, does not train on labels
        contamination = max(min(y_train.mean(), 0.4), 0.01)
        model = IsolationForest(contamination=contamination, random_state=42)
        model.fit(X_train_scaled)
        raw_pred = model.predict(X_test_scaled)       # -1 = anomaly, 1 = normal
        y_pred = (raw_pred == -1).astype(int)
        y_proba = None

    return {
        "precision": round(precision_score(y_test, y_pred, zero_division=0), 4),
        "recall": round(recall_score(y_test, y_pred, zero_division=0), 4),
        "f1_score": round(f1_score(y_test, y_pred, zero_division=0), 4),
        "roc_auc": round(roc_auc_score(y_test, y_proba), 4) if y_proba is not None else None,
        "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
        "n_train_samples": len(X_train),
        "n_test_samples": len(X_test),
        "features_used": FEATURE_COLUMNS,
    }