"""Model initialization and prompt templates for Pydantic AI Harness."""

import logging
from typing import Optional

from pydantic_ai.models import Model
from pydantic_ai.models.google import GoogleModel
from pydantic_ai.providers.google import GoogleProvider
from pydantic_ai.models.test import TestModel

from app.config import settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT_HARNESS = """\
You are BizContext AI, an intelligent organisational assistant and operating harness for the enterprise.
You are connected directly to the organisation's Second Brain knowledge layer and operational backend.

CORE PRINCIPLES & GUIDELINES:
1. SECOND BRAIN FIRST: Whenever the user asks about internal company information, projects, meeting decisions,
   tasks, policies, documents, or personnel, YOU MUST ASK THE BACKEND using your provided tools rather than hallucinating.
2. PERMISSIONS & TENANCY: You operate strictly within the user's organisation scope and authorized access boundaries.
3. CITATIONS & GROUNDING: Always ground your answers in the retrieved Second Brain records. Cite document titles,
   page slugs, meeting dates, or task IDs whenever you refer to specific data.
4. ACTION EXECUTION: When the user requests an operational action (e.g. creating a task, filing a ticket, or
   launching a browser workflow), invoke the appropriate backend tool with structured arguments.
5. CONCISE & ACTIONABLE: Deliver crisp, well-structured markdown answers with bullet points and bold headers.
   Differentiate between source records, derived summaries, and open questions.
"""


def get_harness_model(model_override: Optional[str] = None) -> Model:
    """Initializes and returns the Pydantic AI model configured with the Gemini API key.
    
    Falls back gracefully to TestModel if no API key is configured and fallback is enabled.
    """
    api_key = settings.effective_gemini_api_key
    model_name = model_override or settings.effective_model_name

    if api_key:
        logger.info("Initializing Pydantic AI GoogleModel with model=%s", model_name)
        provider = GoogleProvider(api_key=api_key)
        return GoogleModel(model_name=model_name, provider=provider)

    if settings.enable_test_model_fallback:
        logger.warning(
            "GEMINI_API_KEY not configured. Falling back to Pydantic AI TestModel for testing/development."
        )
        return TestModel()

    raise ValueError(
        "GEMINI_API_KEY is not configured in environment or settings. Please provide a valid Gemini API key."
    )
