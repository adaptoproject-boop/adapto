"""
ADAPTO — Phase B Difficulty Classifier Training
================================================
Trains a Random Forest on labeled sessions stored in Supabase.

Usage:
    python backend/ml/train_difficulty.py

Requirements:
    - Supabase `sessions` table must have >= 500 rows
    - Rows must have `teacher_label` set ('easy', 'medium', 'hard')
      (NULL rows are skipped — they are the unlabeled Phase A data)

Output:
    backend/ml/difficulty_model.pkl  — trained classifier
    backend/ml/scaler.pkl            — StandardScaler fitted on training features
    backend/ml/label_encoder.pkl     — LabelEncoder for target classes
"""

import os
import sys
import json
import joblib
import numpy as np
from datetime import datetime

# Allow imports from backend root
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from config.db import connect_db

# ── sklearn imports (install: pip install scikit-learn) ──────────────────────
try:
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.model_selection import train_test_split, cross_val_score
    from sklearn.preprocessing import StandardScaler, LabelEncoder
    from sklearn.metrics import classification_report, confusion_matrix
except ImportError:
    print("ERROR: scikit-learn not installed. Run: pip install scikit-learn")
    sys.exit(1)

# ── Configuration ─────────────────────────────────────────────────────────────
MODEL_DIR   = os.path.dirname(__file__)
MODEL_PATH  = os.path.join(MODEL_DIR, "difficulty_model.pkl")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.pkl")
LABEL_PATH  = os.path.join(MODEL_DIR, "label_encoder.pkl")
MIN_SAMPLES = 100   # Lower bar for first run; raise to 500 for production

# Feature columns that match the `sessions` Supabase table
FEATURE_COLS = [
    "quiz_score",
    "streak_wrong",
    "streak_correct",
    "retries",
    "video_completion",
    "avg_response_time",
    "confused_ratio",
    "composite_score",
    "pace_score",
]

LABEL_COL = "teacher_label"   # 'easy' | 'medium' | 'hard'


def fetch_labeled_sessions():
    """Pull all rows from Supabase `sessions` where teacher_label IS NOT NULL."""
    supabase = connect_db()
    if supabase is None:
        raise RuntimeError("Cannot connect to Supabase — check .env credentials.")

    result = (
        supabase.table("sessions")
        .select(", ".join(FEATURE_COLS + [LABEL_COL]))
        .not_.is_(LABEL_COL, "null")
        .execute()
    )

    rows = result.data
    print(f"[FETCH] Retrieved {len(rows)} labeled session rows from Supabase.")
    return rows


def rows_to_xy(rows):
    """Convert Supabase rows to numpy X (features) and y (labels)."""
    X, y = [], []

    for row in rows:
        try:
            features = [float(row.get(col, 0) or 0) for col in FEATURE_COLS]
            label    = str(row.get(LABEL_COL, "")).strip().lower()
            if label not in ("easy", "medium", "hard"):
                continue
            X.append(features)
            y.append(label)
        except (ValueError, TypeError) as e:
            print(f"  [SKIP] Bad row: {e}")

    return np.array(X, dtype=float), np.array(y)


def train(X, y):
    """Train RandomForest and return (model, scaler, label_encoder)."""
    # Encode labels
    le = LabelEncoder()
    y_enc = le.fit_transform(y)

    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y_enc, test_size=0.2, random_state=42, stratify=y_enc
    )

    # Random Forest
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=8,
        min_samples_leaf=3,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    # Evaluation
    y_pred = model.predict(X_test)
    print("\n[RESULTS] Classification Report:")
    print(classification_report(y_test, y_pred, target_names=le.classes_))

    print("[RESULTS] Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))

    # Cross-validation
    cv_scores = cross_val_score(model, X_scaled, y_enc, cv=5, scoring="accuracy")
    print(f"\n[CV] 5-Fold Accuracy: {cv_scores.mean():.3f} ± {cv_scores.std():.3f}")

    # Feature importance
    print("\n[IMPORTANCE] Feature importances:")
    for col, imp in sorted(zip(FEATURE_COLS, model.feature_importances_), key=lambda x: -x[1]):
        print(f"  {col:<25} {imp:.4f}")

    return model, scaler, le


def save_artifacts(model, scaler, le):
    """Persist model artifacts to disk."""
    joblib.dump(model,  MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    joblib.dump(le,     LABEL_PATH)
    print(f"\n[SAVED] Model    → {MODEL_PATH}")
    print(f"[SAVED] Scaler   → {SCALER_PATH}")
    print(f"[SAVED] Encoder  → {LABEL_PATH}")

    # Write metadata
    meta = {
        "trained_at":     datetime.utcnow().isoformat(),
        "features":       FEATURE_COLS,
        "classes":        le.classes_.tolist(),
        "n_estimators":   200,
        "phase":          "B",
    }
    with open(os.path.join(MODEL_DIR, "model_metadata.json"), "w") as f:
        json.dump(meta, f, indent=2)
    print("[SAVED] Metadata → backend/ml/model_metadata.json")


def main():
    print("=" * 60)
    print("ADAPTO Phase B — Difficulty Classifier Training")
    print("=" * 60)

    rows = fetch_labeled_sessions()

    if len(rows) < MIN_SAMPLES:
        print(f"\n[WARN] Only {len(rows)} labeled sessions found.")
        print(f"       Need >= {MIN_SAMPLES} to train reliably.")
        print("       Continue collecting data and retry.")
        sys.exit(0)

    X, y = rows_to_xy(rows)
    print(f"[DATA] X shape: {X.shape}   Label distribution: {dict(zip(*np.unique(y, return_counts=True)))}")

    model, scaler, le = train(X, y)
    save_artifacts(model, scaler, le)

    print("\n✅ Training complete! Update orchestrator to use the new model file.")


if __name__ == "__main__":
    main()
