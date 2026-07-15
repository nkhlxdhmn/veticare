"""Singleton ML model loader for disease prediction."""

from __future__ import annotations

import logging
from pathlib import Path
from threading import Lock

import joblib
import pandas as pd
from sklearn.pipeline import Pipeline

logger = logging.getLogger(__name__)

_MODEL_PATH = Path(__file__).resolve().parents[3] / "dataset" / "Random1.joblib"
_FEATURE_COLUMNS = ["AnimalName", "symptoms1", "symptoms2", "symptoms3", "symptoms4", "symptoms5"]

_model: Pipeline | None = None
_lock = Lock()


def _load_model() -> Pipeline:
    """Load the joblib pipeline from disk exactly once."""
    global _model
    if _model is None:
        with _lock:
            if _model is None:
                if not _MODEL_PATH.exists():
                    raise FileNotFoundError(f"Model file not found at {_MODEL_PATH}")
                logger.info("Loading ML model from %s", _MODEL_PATH)
                _model = joblib.load(_MODEL_PATH)
                logger.info("ML model loaded — %d classes", len(_model.classes_))
    return _model


def predict_disease(animal_name: str, symptoms: list[str]) -> dict:
    """Run the ML pipeline and return the predicted disease with confidence.

    Args:
        animal_name: Species name matching training data (e.g. "Dog", "Cat").
        symptoms: Up to 5 symptom strings.

    Returns:
        dict with keys: disease, confidence, probabilities (top 5).
    """
    model = _load_model()

    padded = (symptoms + [""] * 5)[:5]
    row = [[animal_name, *padded]]
    df = pd.DataFrame(row, columns=_FEATURE_COLUMNS)

    predicted: str = model.predict(df)[0]
    proba = model.predict_proba(df)[0]
    confidence = float(proba.max())

    top_indices = proba.argsort()[::-1][:5]
    top_predictions = [
        {"disease": model.classes_[i], "confidence": round(float(proba[i]), 4)}
        for i in top_indices
    ]

    return {
        "disease": predicted,
        "confidence": round(confidence, 4),
        "top_predictions": top_predictions,
    }


def get_model_version() -> str:
    """Return a version identifier derived from the model file's mtime."""
    return str(int(_MODEL_PATH.stat().st_mtime))
