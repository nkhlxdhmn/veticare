from __future__ import annotations

import logging
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.schemas.ai_assistant import (
    AIAssistantRequest,
    AIAssistantResponse,
    AIAssistantErrorResponse,
    AIAssistantPredictionResult,
)
from app.services.ai_emergency_service import TriageLevel, check_emergency, get_triage_level
from app.services.ai_knowledge_service import (
    find_disease,
    get_diseases_count,
    get_knowledge_entry_response,
    search_diseases_by_symptoms,
)
from app.services.ai_llm_service import (
    build_fallback_response,
    call_gemini,
    is_gemini_configured,
)
from app.services.ai_prediction_service import predict
from app.services.ai_prompt_builder import SYSTEM_PROMPT, build_user_prompt

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["AI Assistant"])


def _get_trace_id(request: Request) -> str:
    return getattr(request.state, "trace_id", "unknown")


@router.post(
    "/predict",
    response_model=AIAssistantPredictionResult,
    responses={500: {"model": AIAssistantErrorResponse}},
)
async def ai_predict_disease(req: AIAssistantRequest, request: Request) -> AIAssistantPredictionResult:
    trace_id = _get_trace_id(request)
    try:
        from app.core.config import get_settings
        settings = get_settings()
        model = getattr(request.app.state, "model", None)
        ml_animal_name = settings.api_v1_prefix if hasattr(settings, "api_v1_prefix") else ""
        disease, confidence, top_predictions = predict(
            animal_type=req.animal_type,
            symptoms=req.symptoms,
            model=model,
            ml_animal_name=ml_animal_name,
        )
        logger.info(
            "trace_id=%s predict success: disease=%s confidence=%.4f",
            trace_id, disease, confidence,
        )
        return AIAssistantPredictionResult(
            disease=disease,
            confidence=confidence,
            top_predictions=top_predictions,
        )
    except Exception:
        logger.exception("trace_id=%s prediction failed", trace_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Prediction failed. Please try again.",
        )


@router.post(
    "/ai-assistant",
    response_model=AIAssistantResponse,
    responses={500: {"model": AIAssistantErrorResponse}},
)
async def ai_assistant(req: AIAssistantRequest, request: Request) -> AIAssistantResponse:
    trace_id = _get_trace_id(request)

    try:
        is_emergency, emsg = check_emergency(req.symptoms)
        if is_emergency:
            logger.warning("trace_id=%s emergency detected: %s", trace_id, emsg)
            return AIAssistantResponse(
                prediction=AIAssistantPredictionResult(disease="N/A", confidence=0.0),
                summary="Emergency situation detected. Please seek immediate veterinary care.",
                vet_priority="Emergency",
                disclaimer="This AI-generated guidance is for informational purposes only and does not constitute a veterinary diagnosis.",
                emergency=True,
                emergency_message=emsg,
            )

        disease, confidence, top_predictions = predict(
            animal_type=req.animal_type,
            symptoms=req.symptoms,
        )

        knowledge_entry = find_disease(req.animal_type, disease)
        logger.info(
            "trace_id=%s disease=%s confidence=%.4f kb_found=%s",
            trace_id, disease, confidence, knowledge_entry is not None,
        )

        user_prompt = build_user_prompt(
            animal_type=req.animal_type,
            breed=req.breed,
            age=req.age,
            weight=req.weight,
            symptoms=req.symptoms,
            duration=req.duration,
            eating=req.eating,
            drinking=req.drinking,
            vaccinated=req.vaccinated,
            predicted_disease=disease,
            confidence=confidence,
            knowledge_entry=knowledge_entry,
        )

        llm_result = await call_gemini(SYSTEM_PROMPT, user_prompt)

        if llm_result is None:
            logger.info("trace_id=%s using fallback response (Gemini unavailable)", trace_id)
            llm_result = build_fallback_response(disease, confidence, knowledge_entry)

        triage = get_triage_level(req.symptoms)
        vet_priority = llm_result.get("vet_priority", triage.value)

        return AIAssistantResponse(
            prediction=AIAssistantPredictionResult(
                disease=disease,
                confidence=confidence,
                top_predictions=top_predictions,
            ),
            summary=llm_result.get("summary", "Analysis complete."),
            possible_causes=llm_result.get("possible_causes", []),
            home_care=llm_result.get("home_care", []),
            warning_signs=llm_result.get("warning_signs", []),
            vet_priority=vet_priority,
            prevention=llm_result.get("prevention", []),
            disclaimer=llm_result.get(
                "disclaimer",
                "This AI-generated guidance is for informational purposes only and does not constitute a veterinary diagnosis. Always consult a licensed veterinarian.",
            ),
            emergency=False,
        )

    except HTTPException:
        raise
    except Exception:
        logger.exception("trace_id=%s AI assistant error", trace_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred processing your request. Please try again.",
        )


@router.get("/health/ai", response_model=dict)
async def ai_health() -> dict:
    return {
        "status": "ok",
        "gemini_configured": is_gemini_configured(),
        "knowledge_base_size": get_diseases_count(),
    }
