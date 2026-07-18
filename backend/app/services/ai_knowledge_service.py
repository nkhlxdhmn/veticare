from __future__ import annotations

import json
import logging
from functools import lru_cache
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
DISEASES_PATH = DATA_DIR / "diseases.json"

_SEVERITY_MAP: dict[str, str] = {
    "Emergency": "Emergency",
    "High": "Within 24 hours",
    "Medium": "Within 3 days",
    "Low": "Monitor at home",
}


@lru_cache(maxsize=1)
def load_diseases() -> list[dict]:
    if not DISEASES_PATH.exists():
        logger.warning("Diseases file not found at %s", DISEASES_PATH)
        return []
    with open(DISEASES_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    logger.info("Loaded %d diseases from knowledge base", len(data))
    return data


def _get_name(entry: dict) -> str:
    return entry.get("disease_name") or entry.get("name", "")


def _get_symptoms(entry: dict) -> list[str]:
    return entry.get("symptoms", [])


def _get_vet_priority(entry: dict) -> str:
    severity = entry.get("severity", "")
    if severity in _SEVERITY_MAP:
        return _SEVERITY_MAP[severity]
    return entry.get("vet_priority", "Monitor at home")


def find_disease(animal_type: str, disease_name: str) -> Optional[dict]:
    if not disease_name:
        return None
    diseases = load_diseases()
    at = animal_type.lower().strip()
    dn = disease_name.lower().strip()
    for d in diseases:
        if d.get("animal", "").lower() != at:
            continue
        name = _get_name(d).lower()
        if name == dn:
            return d
        aliases = [a.lower().strip() for a in d.get("aliases", [])]
        if dn in aliases:
            return d
    return None


def get_disease_by_id(disease_id: int) -> Optional[dict]:
    diseases = load_diseases()
    for d in diseases:
        if d.get("id") == disease_id:
            return d
    return None


def search_diseases_by_symptoms(animal_type: str, symptoms: list[str]) -> list[dict]:
    diseases = load_diseases()
    at = animal_type.lower().strip()
    symptom_set = {s.lower().strip() for s in symptoms}
    matches: list[tuple[float, dict]] = []

    for d in diseases:
        if d.get("animal", "").lower() != at:
            continue
        disease_symptoms = {s.lower().strip() for s in _get_symptoms(d)}

        exact_overlap = len(symptom_set & disease_symptoms)

        substring_score = 0
        matched_substrings: set[str] = set()
        for user_sym in symptom_set:
            if user_sym in matched_substrings or user_sym in disease_symptoms:
                continue
            for ds in disease_symptoms:
                if user_sym in ds or ds in user_sym:
                    substring_score += 0.5
                    matched_substrings.add(user_sym)
                    break

        score = exact_overlap + substring_score
        if score > 0:
            matches.append((score, d))

    matches.sort(key=lambda x: x[0], reverse=True)
    return [d for _, d in matches]


def search_diseases_by_animal(animal_type: str) -> list[dict]:
    diseases = load_diseases()
    at = animal_type.lower().strip()
    return [d for d in diseases if d.get("animal", "").lower() == at]


def get_knowledge_entry_response(knowledge_entry: Optional[dict]) -> dict:
    if knowledge_entry is None:
        return {}
    return {
        "description": knowledge_entry.get("description", ""),
        "causes": knowledge_entry.get("common_causes", knowledge_entry.get("causes", [])),
        "home_care": knowledge_entry.get("home_care", []),
        "warning_signs": knowledge_entry.get("warning_signs", []),
        "prevention": knowledge_entry.get("prevention", []),
        "vet_priority": _get_vet_priority(knowledge_entry),
        "vaccination_available": knowledge_entry.get("vaccination_available", False),
        "contagious": knowledge_entry.get("contagious", False),
        "zoonotic": knowledge_entry.get("zoonotic", False),
        "recommended_tests": knowledge_entry.get("recommended_tests", []),
    }


def get_diseases_count() -> int:
    return len(load_diseases())


def reload_knowledge_base() -> None:
    load_diseases.cache_clear()
    count = get_diseases_count()
    logger.info("Knowledge base reloaded: %d diseases", count)
