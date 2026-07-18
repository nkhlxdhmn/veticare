from __future__ import annotations

import asyncio
import json
import logging
import os
import random
from typing import Optional

import httpx

from app.services.ai_knowledge_service import get_knowledge_entry_response

logger = logging.getLogger(__name__)

GEMINI_API_KEY: str = os.environ.get("GEMINI_API_KEY", "")
GEMINI_MODEL: str = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")
GEMINI_API_URL: str = (
    f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"
)

_MAX_RETRIES: int = 3
_BASE_TIMEOUT: float = 30.0
_BASE_DELAY: float = 1.0
_MAX_DELAY: float = 8.0


def is_gemini_configured() -> bool:
    return bool(GEMINI_API_KEY)


async def call_gemini(
    system_prompt: str,
    user_prompt: str,
    temperature: float = 0.3,
    max_output_tokens: int = 1024,
) -> Optional[dict]:
    if not GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY is not set; skipping Gemini call")
        return None

    payload = {
        "contents": [
            {"role": "user", "parts": [{"text": f"{system_prompt}\n\n{user_prompt}"}]}
        ],
        "generationConfig": {
            "temperature": temperature,
            "topP": 0.9,
            "maxOutputTokens": max_output_tokens,
        },
    }

    headers = {"Content-Type": "application/json"}
    url = f"{GEMINI_API_URL}?key={GEMINI_API_KEY}"

    last_exception: Optional[Exception] = None

    for attempt in range(1, _MAX_RETRIES + 1):
        try:
            async with httpx.AsyncClient(timeout=_BASE_TIMEOUT) as client:
                response = await client.post(url, json=payload, headers=headers)
                response.raise_for_status()
                data = response.json()

            candidates = data.get("candidates", [])
            if not candidates:
                logger.error("Gemini attempt %d/%d: no candidates in response", attempt, _MAX_RETRIES)
                if attempt < _MAX_RETRIES:
                    await _backoff(attempt)
                    continue
                return None

            text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
            if not text:
                logger.error("Gemini attempt %d/%d: empty text in response", attempt, _MAX_RETRIES)
                if attempt < _MAX_RETRIES:
                    await _backoff(attempt)
                    continue
                return None

            parsed = _extract_json(text)
            if parsed is None:
                logger.error(
                    "Gemini attempt %d/%d: failed to parse response as JSON: %.200s",
                    attempt, _MAX_RETRIES, text,
                )
                if attempt < _MAX_RETRIES:
                    await _backoff(attempt)
                    continue
                return None

            logger.info("Gemini call succeeded on attempt %d/%d", attempt, _MAX_RETRIES)
            return parsed

        except httpx.TimeoutException:
            logger.warning("Gemini attempt %d/%d: timeout", attempt, _MAX_RETRIES)
            last_exception = None
            if attempt < _MAX_RETRIES:
                await _backoff(attempt)
        except httpx.HTTPStatusError as e:
            logger.error(
                "Gemini attempt %d/%d: HTTP %d: %.200s",
                attempt, _MAX_RETRIES, e.response.status_code, e.response.text,
            )
            if e.response.status_code in (429, 500, 502, 503):
                last_exception = e
                if attempt < _MAX_RETRIES:
                    await _backoff(attempt)
            else:
                return None
        except json.JSONDecodeError as e:
            logger.error("Gemini attempt %d/%d: invalid JSON: %s", attempt, _MAX_RETRIES, e)
            if attempt < _MAX_RETRIES:
                await _backoff(attempt)
            else:
                return None
        except Exception as e:
            logger.exception("Gemini attempt %d/%d: unexpected error: %s", attempt, _MAX_RETRIES, e)
            last_exception = e
            if attempt < _MAX_RETRIES:
                await _backoff(attempt)
            else:
                return None

    return None


async def _backoff(attempt: int) -> None:
    delay = min(_BASE_DELAY * (2 ** (attempt - 1)), _MAX_DELAY)
    jitter = random.uniform(0, delay * 0.25)
    total = delay + jitter
    logger.debug("Backing off %.2fs after attempt %d", total, attempt)
    await asyncio.sleep(total)


def _extract_json(text: str) -> Optional[dict]:
    text = text.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        if len(lines) >= 3:
            text = "\n".join(lines[1:-1])
        else:
            text = lines[-1] if len(lines) == 2 else text
    text = text.strip()
    if text.startswith("```"):
        idx = text.find("\n")
        if idx != -1:
            text = text[idx:].strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        try:
            return json.loads(text[start : end + 1])
        except json.JSONDecodeError:
            pass
    return None


def build_fallback_response(
    predicted_disease: str,
    confidence: float,
    knowledge_entry: Optional[dict],
) -> dict:
    kb = get_knowledge_entry_response(knowledge_entry) if knowledge_entry else {}

    if kb:
        return {
            "summary": kb.get("description", f"The predicted condition is {predicted_disease}."),
            "possible_causes": kb.get("causes", ["Consult a veterinarian for accurate diagnosis"]),
            "home_care": kb.get("home_care", ["Monitor symptoms closely", "Consult a veterinarian"]),
            "warning_signs": kb.get("warning_signs", ["Worsening symptoms", "No improvement in 24 hours"]),
            "vet_priority": kb.get("vet_priority", "Within 24 hours"),
            "prevention": kb.get("prevention", ["Regular veterinary checkups", "Maintain vaccination schedule"]),
            "disclaimer": "This AI-generated guidance is for informational purposes only and does not constitute a veterinary diagnosis. Always consult a licensed veterinarian for medical decisions regarding your pet's health.",
        }

    return {
        "summary": (
            f"The analysis suggests {predicted_disease} with {confidence * 100:.0f}% confidence "
            "based on the reported symptoms. A veterinarian should evaluate the animal for "
            "proper diagnosis and treatment."
        ),
        "possible_causes": ["Could not determine specific causes without detailed knowledge base"],
        "home_care": [
            "Monitor the animal closely for any changes",
            "Ensure access to fresh water",
            "Keep the animal comfortable and stress-free",
            "Consult a veterinarian for proper diagnosis and treatment",
        ],
        "warning_signs": [
            "Symptoms persist or worsen",
            "Difficulty breathing develops",
            "Loss of consciousness or collapse",
            "Refusal to eat or drink for more than 12 hours",
        ],
        "vet_priority": "Within 24 hours",
        "prevention": [
            "Regular veterinary checkups",
            "Maintain up-to-date vaccination schedule",
            "Provide balanced nutrition",
            "Ensure clean living environment",
        ],
        "disclaimer": "This AI-generated guidance is for informational purposes only and does not constitute a veterinary diagnosis. Always consult a licensed veterinarian for medical decisions regarding your pet's health.",
    }
