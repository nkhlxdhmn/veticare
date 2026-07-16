"""ML model loader for disease prediction."""

from __future__ import annotations

import csv
import logging
from pathlib import Path

import joblib
import pandas as pd
from sklearn.pipeline import Pipeline

logger = logging.getLogger(__name__)

_BACKEND_DIR = Path(__file__).resolve().parents[2]
_DATASET_DIR = _BACKEND_DIR / "dataset"

_FEATURE_COLUMNS = ["AnimalName", "symptoms1", "symptoms2", "symptoms3", "symptoms4", "symptoms5"]

_DATASET_PATH: Path | None = None
_SPECIES_SYMPTOMS: dict[str, list[str]] | None = None
_SUPPORTED_SPECIES: list[str] | None = None


def _get_dataset_path() -> Path:
    global _DATASET_PATH
    if _DATASET_PATH is None:
        _DATASET_PATH = _DATASET_DIR / "Animal_Disease_dataset.csv"
    return _DATASET_PATH


def load_species_data() -> tuple[list[str], dict[str, list[str]]]:
    """Load supported species and their symptoms from the training dataset."""
    global _SPECIES_SYMPTOMS, _SUPPORTED_SPECIES
    if _SUPPORTED_SPECIES is not None and _SPECIES_SYMPTOMS is not None:
        return _SUPPORTED_SPECIES, _SPECIES_SYMPTOMS

    path = _get_dataset_path()
    if not path.exists():
        logger.warning("Dataset not found at %s — using fallback species", path)
        fallback = ["Dog", "Cat", "Horse", "Rabbit", "Bird", "Fish", "Cattle"]
        return fallback, {s: ["Fever", "Cough", "Lethargy"] for s in fallback}

    species_map: dict[str, set[str]] = {}
    with open(path, encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            sp = row["AnimalName"].strip()
            if sp not in species_map:
                species_map[sp] = set()
            for i in range(1, 6):
                s = row.get(f"symptoms{i}", "").strip()
                if s:
                    species_map[sp].add(s)

    _SUPPORTED_SPECIES = sorted(species_map.keys())
    _SPECIES_SYMPTOMS = {sp: sorted(syms) for sp, syms in species_map.items()}
    logger.info("Loaded %d species from dataset", len(_SUPPORTED_SPECIES))
    return _SUPPORTED_SPECIES, _SPECIES_SYMPTOMS


def get_symptoms_for_species(species: str) -> list[str]:
    """Return sorted symptom list for a given species."""
    _, species_map = load_species_data()
    return species_map.get(species, [])


def get_supported_species() -> list[str]:
    """Return sorted list of all species the model supports."""
    species, _ = load_species_data()
    return species


def load_model() -> Pipeline:
    """Load the joblib pipeline from the dataset directory."""
    model_path = _DATASET_DIR / "Random1.joblib"
    if not model_path.exists():
        raise FileNotFoundError(f"Model file not found at {model_path}")
    logger.info("Loading ML model from %s", model_path)
    model: Pipeline = joblib.load(model_path)
    logger.info("ML model loaded — %d classes", len(model.classes_))
    return model


def predict_disease(model: Pipeline, animal_name: str, symptoms: list[str]) -> dict:
    """Run the ML pipeline and return the predicted disease with confidence.

    Args:
        model: Loaded sklearn pipeline.
        animal_name: Species name matching training data (e.g. "Dog", "Cat").
        symptoms: Up to 10 symptom strings (padded to 5 for the model).

    Returns:
        dict with keys: disease, confidence, probabilities (top 5).
    """
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
