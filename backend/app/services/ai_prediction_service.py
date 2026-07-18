from __future__ import annotations

import logging
from typing import Optional

from app.services.ai_knowledge_service import (
    _get_name,
    _get_symptoms,
    search_diseases_by_symptoms,
)

logger = logging.getLogger(__name__)


def predict(
    animal_type: str,
    symptoms: list[str],
    model: Optional[object] = None,
    ml_animal_name: str = "",
) -> tuple[str, float, list[dict]]:
    ml_result: Optional[tuple[str, float, list[dict]]] = None
    if model is not None:
        try:
            ml_result = _predict_ml(model, ml_animal_name or animal_type, symptoms)
        except Exception:
            logger.exception("ML prediction failed; falling back to KB-only")

    kb_matches = search_diseases_by_symptoms(animal_type, symptoms)

    if ml_result is not None:
        ml_disease, ml_confidence, ml_top = ml_result
        kb_match = _find_kb_match(kb_matches, ml_disease)
        if kb_match:
            kb_confidence = _kb_confidence(symptoms, kb_match)
            blended = round(ml_confidence * 0.6 + kb_confidence * 0.4, 4)
            return ml_disease, min(blended, 0.99), ml_top
        return ml_disease, round(ml_confidence, 4), ml_top

    if kb_matches:
        best = kb_matches[0]
        disease_name = _get_name(best)
        confidence = _kb_confidence(symptoms, best)
        top = [{"disease": disease_name, "confidence": confidence}]
        for m in kb_matches[1:4]:
            top.append({"disease": _get_name(m), "confidence": round(max(0.1, confidence - 0.15), 2)})
        return disease_name, confidence, top

    logger.info("No matches found for animal=%s symptoms=%s", animal_type, symptoms)
    return "Unknown condition", 0.15, []


def _kb_confidence(symptoms: list[str], entry: dict) -> float:
    symptom_set = {s.lower().strip() for s in symptoms}
    disease_symptoms = {s.lower().strip() for s in _get_symptoms(entry)}
    exact_count = len(symptom_set & disease_symptoms)
    substring_count = 0
    matched: set[str] = set()
    for us in symptom_set:
        if us in matched or us in disease_symptoms:
            continue
        for ds in disease_symptoms:
            if us in ds or ds in us:
                substring_count += 1
                matched.add(us)
                break
    total = len(disease_symptoms)
    if total == 0:
        return 0.15
    raw = (exact_count + substring_count * 0.5) / total
    return round(max(0.15, min(0.95, raw * 0.9 + 0.1)), 2)


def _predict_ml(model: object, animal_name: str, symptoms: list[str]) -> tuple[str, float, list[dict]]:
    import pandas as pd
    from sklearn.pipeline import Pipeline

    if not isinstance(model, Pipeline):
        raise TypeError("Expected sklearn Pipeline, got %s" % type(model).__name__)

    padded = (symptoms + [""] * 5)[:5]
    feature_cols = ["AnimalName", "symptoms1", "symptoms2", "symptoms3", "symptoms4", "symptoms5"]
    row = [[animal_name, *padded]]
    df = pd.DataFrame(row, columns=feature_cols)

    predicted: str = model.predict(df)[0]
    proba = model.predict_proba(df)[0]
    confidence = float(proba.max())

    top_indices = proba.argsort()[::-1][:5]
    top = [
        {"disease": str(model.classes_[i]), "confidence": round(float(proba[i]), 4)}
        for i in top_indices
    ]
    return predicted, round(confidence, 4), top


def _find_kb_match(kb_matches: list[dict], disease_name: str) -> Optional[dict]:
    dn = disease_name.lower().strip()
    for m in kb_matches:
        if _get_name(m).lower() == dn:
            return m
        aliases = [a.lower().strip() for a in m.get("aliases", [])]
        if dn in aliases:
            return m
    return kb_matches[0] if kb_matches else None
