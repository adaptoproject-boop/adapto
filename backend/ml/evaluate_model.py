"""
ADAPTO — Phase B Model Evaluation
===================================
Evaluates the trained difficulty classifier against held-out Supabase data.

Usage:
    python backend/ml/evaluate_model.py

    # Optionally test a single prediction:
    python backend/ml/evaluate_model.py --predict

Outputs:
    - Per-class precision / recall / F1
    - Confusion matrix
    - Feature importance bar chart (saved as ml/feature_importance.png)
"""

import os
import sys
import json
import argparse
import numpy as np

# Allow imports from backend root
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from config.db import connect_db

try:
    import joblib
    from sklearn.metrics import classification_report, confusion_matrix, ConfusionMatrixDisplay
    import matplotlib
    matplotlib.use("Agg")   # headless
    import matplotlib.pyplot as plt
except ImportError:
    print("ERROR: Install dependencies: pip install scikit-learn matplotlib joblib")
    sys.exit(1)

# ── Paths ─────────────────────────────────────────────────────────────────────
MODEL_DIR   = os.path.dirname(__file__)
MODEL_PATH  = os.path.join(MODEL_DIR, "difficulty_model.pkl")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.pkl")
LABEL_PATH  = os.path.join(MODEL_DIR, "label_encoder.pkl")

FEATURE_COLS = [
    "quiz_score", "streak_wrong", "streak_correct", "retries",
    "video_completion", "avg_response_time", "confused_ratio",
    "composite_score", "pace_score",
]
LABEL_COL = "teacher_label"


def load_artifacts():
    for path in [MODEL_PATH, SCALER_PATH, LABEL_PATH]:
        if not os.path.exists(path):
            print(f"ERROR: {path} not found. Run train_difficulty.py first.")
            sys.exit(1)

    model  = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    le     = joblib.load(LABEL_PATH)
    print(f"[LOAD] Model loaded from {MODEL_PATH}")

    # Print metadata
    meta_path = os.path.join(MODEL_DIR, "model_metadata.json")
    if os.path.exists(meta_path):
        with open(meta_path) as f:
            meta = json.load(f)
        print(f"[META] Trained at: {meta.get('trained_at', 'unknown')}")
        print(f"[META] Classes:    {meta.get('classes', [])}")

    return model, scaler, le


def fetch_evaluation_data():
    """Pull labeled sessions for evaluation (same table as training)."""
    supabase = connect_db()
    if supabase is None:
        raise RuntimeError("Cannot connect to Supabase — check .env credentials.")

    result = (
        supabase.table("sessions")
        .select(", ".join(FEATURE_COLS + [LABEL_COL]))
        .not_.is_(LABEL_COL, "null")
        .execute()
    )
    return result.data


def evaluate(model, scaler, le, rows):
    X, y = [], []
    for row in rows:
        try:
            feats = [float(row.get(col, 0) or 0) for col in FEATURE_COLS]
            label = str(row.get(LABEL_COL, "")).strip().lower()
            if label not in ("easy", "medium", "hard"):
                continue
            X.append(feats)
            y.append(label)
        except Exception:
            pass

    if not X:
        print("[WARN] No valid labeled rows found for evaluation.")
        return

    X = np.array(X, dtype=float)
    X_scaled = scaler.transform(X)
    y_enc     = le.transform(y)
    y_pred    = model.predict(X_scaled)

    print(f"\n[EVAL] {len(X)} samples evaluated.")
    print("\n[REPORT] Classification Report:")
    print(classification_report(y_enc, y_pred, target_names=le.classes_))

    cm = confusion_matrix(y_enc, y_pred)
    print("[REPORT] Confusion Matrix:")
    print(cm)

    # Save confusion matrix plot
    fig, ax = plt.subplots(figsize=(6, 5))
    disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=le.classes_)
    disp.plot(ax=ax, colorbar=False, cmap="Blues")
    ax.set_title("ADAPTO Difficulty Classifier — Confusion Matrix")
    cm_path = os.path.join(MODEL_DIR, "confusion_matrix.png")
    plt.tight_layout()
    plt.savefig(cm_path, dpi=150)
    print(f"\n[SAVED] Confusion matrix → {cm_path}")

    # Feature importance
    if hasattr(model, "feature_importances_"):
        importances = model.feature_importances_
        indices = np.argsort(importances)[::-1]
        fig2, ax2 = plt.subplots(figsize=(8, 4))
        ax2.bar(range(len(FEATURE_COLS)), importances[indices], color="#6366f1")
        ax2.set_xticks(range(len(FEATURE_COLS)))
        ax2.set_xticklabels([FEATURE_COLS[i] for i in indices], rotation=40, ha="right", fontsize=9)
        ax2.set_title("Feature Importances — ADAPTO Difficulty RF")
        ax2.set_ylabel("Importance")
        fi_path = os.path.join(MODEL_DIR, "feature_importance.png")
        plt.tight_layout()
        plt.savefig(fi_path, dpi=150)
        print(f"[SAVED] Feature importance → {fi_path}")


def predict_sample(model, scaler, le):
    """Interactive single-sample prediction for manual testing."""
    print("\n[PREDICT] Enter values for a sample prediction:")
    vals = []
    defaults = [75, 0, 2, 1, 0.85, 8, 0.1, 0.65, 0.9]
    for col, dflt in zip(FEATURE_COLS, defaults):
        raw = input(f"  {col} [{dflt}]: ").strip()
        vals.append(float(raw) if raw else dflt)

    X = np.array([vals], dtype=float)
    X_scaled = scaler.transform(X)
    pred_enc  = model.predict(X_scaled)[0]
    proba     = model.predict_proba(X_scaled)[0]
    pred_label = le.inverse_transform([pred_enc])[0]

    print(f"\n  → Predicted Difficulty: {pred_label.upper()}")
    print("  → Class probabilities:")
    for cls, p in zip(le.classes_, proba):
        bar = "█" * int(p * 30)
        print(f"     {cls:8s} {bar:<30} {p:.1%}")


def main():
    parser = argparse.ArgumentParser(description="ADAPTO Model Evaluation")
    parser.add_argument("--predict", action="store_true", help="Run interactive prediction")
    args = parser.parse_args()

    print("=" * 60)
    print("ADAPTO Phase B — Model Evaluation")
    print("=" * 60)

    model, scaler, le = load_artifacts()

    if args.predict:
        predict_sample(model, scaler, le)
    else:
        rows = fetch_evaluation_data()
        print(f"[FETCH] {len(rows)} labeled rows retrieved.")
        evaluate(model, scaler, le, rows)


if __name__ == "__main__":
    main()
