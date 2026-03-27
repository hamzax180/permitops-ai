"""
ai_fallback.py
--------------
Last-resort AI call used only when:
  1. No keyword match found
  2. No predefined response found
  3. No cache hit

Reuses the existing Gemini model instances from main.py (passed in at call time)
so the agent's full system prompt is preserved. Adds a conciseness constraint suffix
and caps output at 100 tokens.

Only the latest user message is sent — NO conversation history.
"""

import asyncio
from typing import Optional

# Conciseness constraint appended to every fallback call
_CONCISE_SUFFIX = (
    "\n\n[IMPORTANT: Reply in maximum 2 short sentences. "
    "No bullet lists. No boilerplate. Natural, friendly tone only.]"
)


async def ai_fallback_response(
    query: str,
    assistant_type: str = "permit",
    gemini_model=None,
    student_model=None,
    lawyer_model=None,
) -> Optional[str]:
    """
    Call the appropriate Gemini model for a fallback response.

    Args:
        query:          The latest user message (only this is sent — no history).
        assistant_type: "permit" | "student" | "lawyer"
        gemini_model:   The permit Gemini model instance from main.py
        student_model:  The student Gemini model instance from main.py
        lawyer_model:   The lawyer Gemini model instance from main.py

    Returns:
        AI-generated response string, or None on failure.
    """
    # Select the model matching the active agent
    model_map = {
        "permit": gemini_model,
        "student": student_model,
        "lawyer": lawyer_model,
    }
    model = model_map.get(assistant_type, gemini_model)

    if model is None:
        print(f"[AI Fallback] No model available for assistant_type={assistant_type}")
        return None

    prompt = query + _CONCISE_SUFFIX

    try:
        print(f"[SmartRouter] AI FALLBACK triggered for assistant_type={assistant_type}, query='{query[:60]}'")
        response = await asyncio.to_thread(
            model.generate_content,
            prompt,
            generation_config={"max_output_tokens": 100},
        )
        text = response.text.strip()
        print(f"[SmartRouter] AI FALLBACK response ({len(text)} chars)")
        return text
    except Exception as e:
        print(f"[AI Fallback] Error: {e}")
        return None
