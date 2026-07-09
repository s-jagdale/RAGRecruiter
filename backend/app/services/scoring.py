"""
Answer scoring service.

Scores a candidate's answer to an interview question against a rubric
(clarity, relevance, depth), and provides specific feedback. This is the
"evaluation" step that closes the agentic loop: analyze -> generate -> score.
"""

import json
import re
from app.watsonx_client import granite_chat


# Track → how the ideal answer should be shaped
_IDEAL_ANSWER_GUIDANCE = {
    "technical":   "Be specific and precise, use concrete technical terminology, and explicitly mention "
                   "tradeoffs or alternative approaches. Depth of reasoning matters more than storytelling.",
    "soft_skills": "Focus on how the candidate communicated, listened, and managed the human/emotional side "
                   "of the situation. Show empathy, self-awareness, and clear interpersonal reasoning rather "
                   "than technical detail.",
    "behavioral":  "Use the STAR structure (Situation, Task, Action, Result), weaving it naturally into prose "
                   "without labeling each part. Emphasize concrete actions taken and measurable outcomes.",
    "mixed":       "Use the STAR structure for behavioral-style questions and precise technical reasoning for "
                   "technical-style questions, whichever fits the question asked.",
}


def generate_ideal_answer(question_text: str, job_role: str, track: str = "mixed") -> str:
    """
    Ask Granite to produce a strong model answer for the given interview
    question, job role, and track. Returned as a plain string.
    """
    guidance = _IDEAL_ANSWER_GUIDANCE.get(track, _IDEAL_ANSWER_GUIDANCE["mixed"])

    prompt = f"""You are an expert interview coach demonstrating an ideal answer.

JOB ROLE: {job_role}

INTERVIEW TRACK: {track}

INTERVIEW QUESTION: {question_text}

Write a concise, high-quality model answer a strong candidate would give.
- {guidance}
- Keep it to 150-220 words — detailed but not rambling.
- Write in first person as the candidate.
- Do NOT include labels like "Situation:" — weave any structure naturally into prose.

Respond with ONLY the answer text, no preamble."""

    return granite_chat(
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5,
        max_tokens=600
    )


def _extract_json(text: str) -> dict:
    text = text.strip()
    text = re.sub(r"^```json\s*|\s*```$", "", text, flags=re.MULTILINE)
    text = text.strip()

    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        text = match.group(0)

    return json.loads(text)


# Track → what "depth" and overall focus should mean when scoring
_SCORING_RUBRIC = {
    "technical":   "- Depth: Does the answer show correct technical reasoning, concrete terminology, "
                   "and awareness of tradeoffs or edge cases (vs. vague or incorrect generalities)?",
    "soft_skills": "- Depth: Does the answer show empathy, self-awareness, and specific interpersonal actions "
                   "the candidate personally took (vs. vague statements like 'I'm a good communicator')?",
    "behavioral":  "- Depth: Does the answer follow a clear situation/action/result arc with specific details "
                   "and a measurable or concrete outcome (vs. a vague anecdote with no clear result)?",
    "mixed":       "- Depth: Does it include specific details, examples, numbers, or concrete outcomes "
                   "(vs. vague generalities)?",
}


# Minimum answer length (in words) before we even bother asking the model to
# score it. Below this, the answer is scored 1/1/1 directly — an LLM asked to
# "score 1-5" on blank or near-blank input doesn't reliably return a 1; it can
# just as easily hallucinate a plausible mid-range score, which is what was
# happening before this guard existed.
_MIN_ANSWER_WORDS = 4


def _is_effectively_blank(answer_text: str) -> bool:
    stripped = (answer_text or "").strip()
    if not stripped:
        return True
    return len(stripped.split()) < _MIN_ANSWER_WORDS


def score_answer(question_text: str, answer_text: str, job_role: str, track: str = "mixed") -> dict:
    """
    Returns: {"clarity_score": int, "relevance_score": int, "depth_score": int, "feedback": str}
    Each score is 1-5. Scoring focus adapts to the interview track.
    """
    if _is_effectively_blank(answer_text):
        return {
            "clarity_score": 1,
            "relevance_score": 1,
            "depth_score": 1,
            "feedback": "No substantive answer was provided. Give a complete response that directly "
                       "addresses the question, with specific details or examples, to receive real feedback.",
        }

    depth_criterion = _SCORING_RUBRIC.get(track, _SCORING_RUBRIC["mixed"])

    prompt = f"""You are an expert interview coach evaluating a candidate's answer.

JOB ROLE: {job_role}

INTERVIEW TRACK: {track}

QUESTION ASKED: {question_text}

CANDIDATE'S ANSWER: {answer_text}

If the candidate's answer is empty, off-topic, a placeholder like "N/A" or "test", or otherwise
does not attempt to address the question, score every dimension 1 and say so plainly in the
feedback — do not give credit for structure or tone in the absence of real content.

Score the answer on three dimensions, each from 1 (poor) to 5 (excellent), with the focus appropriate to the {track} track:

Respond with ONLY a valid JSON object in this exact format, no other text:
{{
  "clarity_score": 1-5,
  "relevance_score": 1-5,
  "depth_score": 1-5,
  "feedback": "2-3 specific, actionable sentences of feedback for the candidate, focused on the {track} track"
}}"""

    response_text = granite_chat(
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=500
    )

    try:
        result = _extract_json(response_text)
        for key in ["clarity_score", "relevance_score", "depth_score"]:
            result[key] = max(1, min(5, int(result.get(key, 3))))
        return result
    except (json.JSONDecodeError, AttributeError, ValueError, TypeError):
        return {
            "clarity_score": 3,
            "relevance_score": 3,
            "depth_score": 3,
            "feedback": "Unable to generate detailed feedback automatically. "
                       "Consider adding more specific examples and measurable outcomes to your answer."
        }


# Track → what the final readiness summary should emphasize
_SUMMARY_FOCUS = {
    "technical":   "Focus the assessment on technical correctness, depth of reasoning, and problem-solving ability.",
    "soft_skills": "Focus the assessment on communication style, empathy, self-awareness, and interpersonal effectiveness.",
    "behavioral":  "Focus the assessment on how well the candidate structures past experiences (STAR) and the "
                   "concreteness of the outcomes they describe.",
    "mixed":       "Give a balanced assessment across technical and behavioral dimensions.",
}


def generate_session_summary(job_role: str, question_answer_scores: list[dict], track: str = "mixed") -> dict:
    """
    Given all Q&A pairs and scores from a session, produce a final readiness summary.
    The assessment focus adapts to the interview track.

    question_answer_scores: list of dicts like:
      {"question": "...", "answer": "...", "clarity_score": 4, "relevance_score": 3,
       "depth_score": 3, "feedback": "..."}
    """
    summary_input = "\n\n".join(
        f"Q: {item.get('question')}\n"
        f"A: {item.get('answer')}\n"
        f"Scores - Clarity: {item.get('clarity_score')}, Relevance: {item.get('relevance_score')}, "
        f"Depth: {item.get('depth_score')}\n"
        f"Feedback: {item.get('feedback')}"
        for item in question_answer_scores
    )

    focus = _SUMMARY_FOCUS.get(track, _SUMMARY_FOCUS["mixed"])

    prompt = f"""You are an expert interview coach summarizing a completed mock interview session.

JOB ROLE: {job_role}

INTERVIEW TRACK: {track}

SESSION TRANSCRIPT WITH SCORES:
{summary_input}

Based on all the questions, answers, and scores above, provide an overall assessment.
{focus}

Respond with ONLY a valid JSON object in this exact format, no other text:
{{
  "readiness_score": 1-10,
  "strengths": ["strength1", "strength2"],
  "gaps": ["gap1", "gap2"],
  "recommendations": ["specific actionable recommendation1", "recommendation2"]
}}"""

    response_text = granite_chat(
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4,
        max_tokens=800
    )

    try:
        result = _extract_json(response_text)
        result["readiness_score"] = max(1, min(10, int(result.get("readiness_score", 5))))
        return result
    except (json.JSONDecodeError, AttributeError, ValueError, TypeError):
        return {
            "readiness_score": 5,
            "strengths": ["Completed the mock interview session"],
            "gaps": ["Unable to generate detailed analysis automatically"],
            "recommendations": ["Review individual question feedback above for specific improvement areas"]
        }