SYSTEM_PROMPT = """You are an AI veterinary guidance assistant. You are NOT a veterinarian and you NEVER provide a definitive diagnosis.

## Core Rules
1. Never claim certainty about a diagnosis — always phrase as "may indicate" or "could be associated with".
2. Never prescribe or recommend specific medications, drug names, or dosages.
3. Never diagnose — describe possibilities, never state a disease as fact.
4. Always recommend visiting a veterinarian for severe, persistent, or worsening symptoms.
5. Always include the standard medical disclaimer verbatim in every response.
6. Respond in valid JSON only. No markdown, no code fences, no extra text outside the JSON object.
7. Keep explanations concise and accessible to pet owners (plain language, avoid medical jargon without explanation).
8. Base your response ONLY on the veterinary knowledge provided in the user prompt.
9. If the predicted disease or knowledge base entry seems uncertain, clearly communicate that uncertainty.
10. If the user reports symptoms that don't match the predicted disease well, note the discrepancy.

## Output Format
Return ONLY a JSON object with exactly these keys:
{
  "summary": "2-3 sentence plain-language explanation of what the symptoms may indicate.",
  "possible_causes": ["cause1", "cause2", "cause3"],
  "home_care": ["care1", "care2", "care3"],
  "warning_signs": ["sign1", "sign2"],
  "vet_priority": "Emergency | Within 24 hours | Within 3 days | Monitor at home",
  "prevention": ["tip1", "tip2"],
  "disclaimer": "This AI-generated guidance is for informational purposes only and does not constitute a veterinary diagnosis. Always consult a licensed veterinarian for medical decisions regarding your pet's health."
}
"""


def build_user_prompt(
    animal_type: str,
    breed: str | None,
    age: float | None,
    weight: float | None,
    symptoms: list[str],
    duration: str | None,
    eating: str | None,
    drinking: str | None,
    vaccinated: bool | None,
    predicted_disease: str,
    confidence: float,
    knowledge_entry: dict | None,
) -> str:
    sections = ["## Patient Information"]
    sections.append(f"- Animal: {animal_type}")
    if breed:
        sections.append(f"- Breed: {breed}")
    if age is not None:
        sections.append(f"- Age: {age} years")
    if weight is not None:
        sections.append(f"- Weight: {weight} kg")

    sections.append("")
    sections.append("## Reported Symptoms")
    sections.append(f"- Symptoms: {', '.join(symptoms)}")
    if duration:
        sections.append(f"- Duration: {duration}")
    if eating:
        sections.append(f"- Eating: {eating}")
    if drinking:
        sections.append(f"- Drinking: {drinking}")
    if vaccinated is not None:
        sections.append(f"- Vaccinated: {'Yes' if vaccinated else 'No'}")

    sections.append("")
    sections.append("## ML Prediction")
    sections.append(f"- Predicted condition: {predicted_disease}")
    sections.append(f"- Confidence: {confidence * 100:.0f}%")

    if knowledge_entry:
        sections.append("")
        sections.append("## Knowledge Base Information")
        desc = knowledge_entry.get("description") or knowledge_entry.get("description", "")
        if desc:
            sections.append(f"- Description: {desc}")

        causes = knowledge_entry.get("common_causes") or knowledge_entry.get("causes", [])
        if causes:
            sections.append(f"- Common causes: {'; '.join(causes)}")

        home_care = knowledge_entry.get("home_care", [])
        if home_care:
            sections.append(f"- Home care: {'; '.join(home_care)}")

        warning = knowledge_entry.get("warning_signs", [])
        if warning:
            sections.append(f"- Warning signs: {'; '.join(warning)}")

        prevention = knowledge_entry.get("prevention", [])
        if prevention:
            sections.append(f"- Prevention: {'; '.join(prevention)}")

        vet_priority = (
            knowledge_entry.get("vet_priority")
            or _severity_to_priority(knowledge_entry.get("severity", ""))
            or "Not specified"
        )
        sections.append(f"- Veterinary priority: {vet_priority}")

        contagious = knowledge_entry.get("contagious")
        if contagious is not None:
            sections.append(f"- Contagious: {'Yes' if contagious else 'No'}")

        zoonotic = knowledge_entry.get("zoonotic")
        if zoonotic is not None:
            sections.append(f"- Zoonotic (can spread to humans): {'Yes' if zoonotic else 'No'}")
    else:
        sections.append("")
        sections.append("*No detailed knowledge base entry is available for this prediction.*")

    return "\n".join(sections)


def _severity_to_priority(severity: str) -> str | None:
    mapping = {
        "Emergency": "Emergency",
        "High": "Within 24 hours",
        "Medium": "Within 3 days",
        "Low": "Monitor at home",
    }
    return mapping.get(severity)
