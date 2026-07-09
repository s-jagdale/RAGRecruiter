"""
Gap analysis service — the core "decision" step of the agent.

Takes a candidate's resume text + target job role, and uses Granite to
identify which competencies/skills are missing or underdeveloped relative
to that role. This output drives which questions get generated next,
making the flow genuinely agentic rather than a single Q&A pass.
"""

import json
import re
from app.watsonx_client import granite_chat
from app.rag.retriever import retrieve_relevant_chunks


def _extract_json(text: str) -> dict:
    """
    Granite sometimes wraps JSON in markdown code fences or adds preamble text.
    This strips that out and parses the first valid JSON object found.
    """
    text = text.strip()
    text = re.sub(r"^```json\s*|\s*```$", "", text, flags=re.MULTILINE)
    text = text.strip()

    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        text = match.group(0)

    return json.loads(text)


# Track → what kind of "gaps" gap analysis should even be looking for.
# This keeps focus_areas aligned with the track, so question_gen doesn't
# later get pulled toward technical topics just because focus_areas mention them.
_GAP_FOCUS_INSTRUCTION = {
    "technical":   "an expert technical recruiter. Focus only on technical skills, tools, and "
                   "technical competencies the resume is missing or under-develops relative to the role.",
    "soft_skills": "an expert people manager. Ignore missing technical tools/frameworks entirely. "
                   "Focus only on interpersonal and communication competencies the resume doesn't clearly "
                   "demonstrate — e.g. leadership, cross-team communication, mentoring, conflict handling, "
                   "stakeholder management, giving/receiving feedback.",
    "behavioral":  "an expert behavioral interviewer. Ignore missing technical tools/frameworks entirely. "
                   "Focus only on past-experience competencies the resume doesn't clearly demonstrate — e.g. "
                   "handling ambiguity, ownership under pressure, learning from failure, cross-functional collaboration.",
    "mixed":       "an expert technical recruiter. Focus on a balanced mix of technical skills and "
                   "interpersonal/behavioral competencies the resume is missing relative to the role.",
}


def analyze_gaps(resume_text: str, job_role: str, track: str = "mixed", job_description: str = "") -> dict:
    """
    Returns a dict with:
      - focus_areas: list of skill/competency gaps to target with questions
      - identified_skills: list of skills already present in the resume
      - reasoning: brief explanation of the analysis

    The kind of "gap" looked for adapts to the interview track, so a Soft
    Skills session doesn't end up with technical-skill-named focus areas
    that later pull question generation toward technical questions.

    job_description is optional — when provided, it's used alongside the
    RAG-retrieved role context so gaps are measured against this specific
    posting's stated requirements, not just generic role expectations.
    """
    # Retrieve role-relevant context to ground the analysis (RAG step)
    relevant_chunks = retrieve_relevant_chunks(
        query=f"key skills and expectations for {job_role}",
        role=job_role,
        top_k=4,
        track=track
    )
    context_text = "\n".join(f"- {chunk['content']}" for chunk in relevant_chunks)

    persona_instruction = _GAP_FOCUS_INSTRUCTION.get(track, _GAP_FOCUS_INSTRUCTION["mixed"])

    job_description_block = ""
    if job_description and job_description.strip():
        job_description_block = f"""
SPECIFIC JOB DESCRIPTION (weigh this over the generic role expectations below wherever they conflict):
{job_description.strip()}
"""

    prompt = f"""You are {persona_instruction}

TARGET JOB ROLE: {job_role}
{job_description_block}
RELEVANT ROLE EXPECTATIONS (reference context):
{context_text}

CANDIDATE RESUME:
{resume_text}

Analyze the resume against the target role and respond with ONLY a valid JSON object in this exact format, no other text:
{{
  "identified_skills": ["skill1", "skill2", "skill3"],
  "focus_areas": ["gap1", "gap2", "gap3"],
  "reasoning": "1-2 sentence explanation of why these are the focus areas"
}}

"identified_skills" = competencies clearly present in the resume relevant to this role and track.
"focus_areas" = 3-5 specific competencies or experience gaps that should be probed in interview questions,
staying strictly within the scope described above — do not stray outside it even if the resume suggests other gaps."""

    response_text = granite_chat(
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=800
    )

    try:
        result = _extract_json(response_text)
    except (json.JSONDecodeError, AttributeError):
        # Fallback if Granite doesn't return clean JSON
        result = {
            "identified_skills": [],
            "focus_areas": ["General role-specific competencies"],
            "reasoning": "Automatic parsing failed; defaulting to general questions."
        }

    return result