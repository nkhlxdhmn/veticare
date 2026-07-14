"""
A simple recommendation engine based on predicted diseases.
"""

RECOMMENDATIONS = {
    "Canine Distemper": {
        "dangerous": True,
        "recommendation": "This is a highly contagious and serious viral illness. Isolate the pet and consult a veterinarian immediately for diagnosis and supportive care."
    },
    "Parvovirus": {
        "dangerous": True,
        "recommendation": "Parvovirus is a severe and often fatal disease. Seek immediate veterinary care. Strict isolation is crucial to prevent spread."
    },
    "Default": {
        "dangerous": False,
        "recommendation": "While the condition may not appear critical, it is always best to consult a veterinarian for an accurate diagnosis and treatment plan."
    }
}
def get_recommendation(disease: str) -> dict:
    """Returns a recommendation and danger level for a given disease."""
    return RECOMMENDATIONS.get(disease, RECOMMENDATIONS["Default"])