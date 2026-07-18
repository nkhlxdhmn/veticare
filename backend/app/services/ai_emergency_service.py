from __future__ import annotations

import logging
from enum import Enum

logger = logging.getLogger(__name__)


class TriageLevel(str, Enum):
    EMERGENCY = "Emergency"
    URGENT = "Within 24 hours"
    ROUTINE = "Within 3 days"
    MONITOR = "Monitor at home"


_IMMEDIATE_EMERGENCY: set[str] = {
    "not breathing", "unconscious", "unconsciousness", "collapse", "collapsed",
    "severe bleeding", "heavy bleeding", "uncontrollable bleeding",
    "severe difficulty breathing", "choking", "suspected poisoning", "poisoning",
    "severe trauma", "electrical shock", "heat stroke", "severe burn",
    "open fracture", "eye injury", "seizure", "seizures",
    "unresponsive", "cardiac arrest", "drowning", "hit by car",
    "profuse bloody diarrhea", "bloody diarrhea", "blood in stool",
}

_URGENT_SYMPTOMS: set[str] = {
    "difficulty breathing", "labored breathing", "rapid breathing",
    "vomiting", "persistent vomiting", "vomiting blood",
    "diarrhea", "persistent diarrhea", "blood in urine",
    "fever", "high fever", "lethargy", "extreme lethargy",
    "loss of appetite", "not eating", "not drinking",
    "dehydration", "skin tenting", "dry gums",
    "pale gums", "yellow gums", "blue gums",
    "swollen abdomen", "distended abdomen",
    "unable to urinate", "straining to urinate",
    "broken bone", "limping", "non-weight bearing lameness",
    "bleeding", "blood", "wound", "deep wound",
    "burn", "bloat", "gastric dilatation",
    "ingested foreign object", "swallowed something",
    "allergic reaction", "hives", "facial swelling",
    "eye discharge", "eye redness", "squinting",
    "head tilt", "circling", "disorientation",
    "paralysis", "unable to walk", "dragging limb",
}

_CRITICAL_COMBINATIONS: list[set[str]] = [
    {"difficulty breathing", "collapse"},
    {"seizures", "unconscious"},
    {"severe bleeding", "collapse"},
    {"vomiting", "collapse"},
    {"vomiting", "blood", "collapse"},
    {"not eating", "not drinking", "lethargy"},
    {"fever", "lethargy", "vomiting"},
    {"bloat", "retching", "distressed"},
    {"hit by car", "bleeding"},
]


def _triage_symptoms(symptoms: list[str]) -> tuple[bool, str, TriageLevel]:
    symptom_set = {s.lower().strip() for s in symptoms}

    immediate = symptom_set & _IMMEDIATE_EMERGENCY
    if immediate:
        primary = sorted(immediate)[0]
        msg = (
            f"Emergency detected: {primary}. "
            "This requires immediate veterinary attention. "
            "Do not wait — seek emergency veterinary care now."
        )
        return True, msg, TriageLevel.EMERGENCY

    for combo in _CRITICAL_COMBINATIONS:
        if combo.issubset(symptom_set):
            return (
                True,
                "Critical symptom combination detected. "
                "Seek immediate veterinary care.",
                TriageLevel.EMERGENCY,
            )

    urgent = symptom_set & _URGENT_SYMPTOMS
    if urgent:
        primary = sorted(urgent)[0]
        return (
            False,
            f"Urgent symptom detected: {primary}. "
            "Schedule a veterinary visit within 24 hours.",
            TriageLevel.URGENT,
        )

    return False, "", TriageLevel.MONITOR


def check_emergency(symptoms: list[str]) -> tuple[bool, str]:
    is_emergency, msg, _ = _triage_symptoms(symptoms)
    if is_emergency:
        logger.warning("Emergency triage triggered: %s", msg)
    return is_emergency, msg


def get_triage_level(symptoms: list[str]) -> TriageLevel:
    _, _, level = _triage_symptoms(symptoms)
    return level
