"""
Question generation service.

Combines RAG-retrieved question bank content with Granite generation to
produce interview questions tailored to the candidate's identified gaps.
This is what makes the question set "grounded" rather than purely
model-hallucinated — retrieved chunks anchor the question style and content.
"""

import json
import re
from app.watsonx_client import granite_chat
from app.rag.retriever import retrieve_relevant_chunks


def _extract_json(text: str) -> dict:
    text = text.strip()
    text = re.sub(r"^```json\s*|\s*```$", "", text, flags=re.MULTILINE)
    text = text.strip()

    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        text = match.group(0)

    return json.loads(text)


# Track → question type guidance
_TRACK_GUIDANCE = {
    "technical":   "Generate ONLY technical questions (algorithms, system design, tools, code concepts).",
    "soft_skills": "Generate ONLY soft-skills / communication / leadership behavioral questions.",
    "behavioral":  "Generate ONLY behavioral questions using the STAR framework (situations, challenges, teamwork).",
    "mixed":       "Mix technical and behavioral questions as appropriate for the role.",
}

# Track → example question_type values shown in the few-shot JSON schema,
# so the example itself doesn't bias the model toward technical questions
# on non-technical tracks.
_TRACK_EXAMPLE_TYPES = {
    "technical":   ["technical", "technical"],
    "soft_skills": ["soft_skills", "soft_skills"],
    "behavioral":  ["behavioral", "behavioral"],
    "mixed":       ["technical", "behavioral"],
}

def generate_questions(
    resume_text: str,
    job_role: str,
    focus_areas: list[str],
    num_questions: int = 5,
    track: str = "mixed",
    job_description: str = "",
) -> list[dict]:
    """
    Returns a list of question dicts: [{"question_text", "question_type", "targets_gap"}]

    job_description is optional — when provided, questions are grounded in
    this specific posting's requirements in addition to the resume gaps.
    """
    # Retrieve relevant question bank examples for this role + focus areas (RAG step)
    query = f"interview questions for {job_role} covering {', '.join(focus_areas)}"
    relevant_chunks = retrieve_relevant_chunks(
        query=query,
        role=job_role,
        top_k=6,
        track=track
    )
    context_text = "\n".join(
        f"- [{chunk['category']}] {chunk['content']}" for chunk in relevant_chunks
    )
    track_instruction = _TRACK_GUIDANCE.get(track, _TRACK_GUIDANCE["mixed"])
    example_types = _TRACK_EXAMPLE_TYPES.get(track, _TRACK_EXAMPLE_TYPES["mixed"])

    job_description_block = ""
    if job_description and job_description.strip():
        job_description_block = f"""
SPECIFIC JOB DESCRIPTION (prefer questions that probe requirements stated here):
{job_description.strip()}
"""

    prompt = f"""You are an expert interviewer creating a tailored question set.

TARGET JOB ROLE: {job_role}
{job_description_block}
TRACK INSTRUCTION: {track_instruction}


FOCUS AREAS TO PROBE (gaps identified from candidate's resume):
{chr(10).join(f"- {area}" for area in focus_areas)}

REFERENCE QUESTION BANK / EXAMPLES (use these as inspiration and grounding, don't copy verbatim):
{context_text}

CANDIDATE RESUME SUMMARY:
{resume_text[:1500]}

Generate exactly {num_questions} interview questions that specifically target the focus areas above,
but the QUESTION TYPE must always obey the TRACK INSTRUCTION above the focus areas in priority — even if a
focus area sounds technical, phrase the question in the style the track requires (e.g. on the Soft Skills
track, ask about communicating, leading, or collaborating around that area, not about solving it technically).
Do not generate any technical/coding/system-design questions unless the TRACK INSTRUCTION explicitly allows it.

Respond with ONLY a valid JSON object in this exact format, no other text:
{{
  "questions": [
    {{"question_text": "...", "question_type": "{example_types[0]}", "targets_gap": "gap name"}},
    {{"question_text": "...", "question_type": "{example_types[1]}", "targets_gap": "gap name"}}
  ]
}}"""

    response_text = granite_chat(
        messages=[{"role": "user", "content": prompt}],
        temperature=0.6,
        max_tokens=1200
    )

    try:
        result = _extract_json(response_text)
        return result.get("questions", [])
    except (json.JSONDecodeError, AttributeError):
        # Fallback: return generic questions if parsing fails
        return [
            {
                "question_text": f"Tell me about your experience relevant to {area}.",
                "question_type": "behavioral",
                "targets_gap": area
            }
            for area in focus_areas[:num_questions]
        ]