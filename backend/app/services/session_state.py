"""
In-memory session state store — extended to support user ownership.

Sessions still live in memory (fast, no latency) but are persisted to SQLite
at the end of each interview so the history is durable.
"""

import uuid

_sessions: dict[str, dict] = {}


def create_session(job_role: str, resume_text: str, focus_areas: list[str],
                   user_id: int = None, track: str = "mixed") -> str:
    session_id = str(uuid.uuid4())
    _sessions[session_id] = {
        "job_role":              job_role,
        "resume_text":           resume_text,
        "focus_areas":           focus_areas,
        "question_answer_scores": [],
        "user_id":               user_id,
        "track":                 track,
    }
    return session_id


def get_session(session_id: str) -> dict:
    if session_id not in _sessions:
        raise KeyError(f"Session {session_id} not found.")
    return _sessions[session_id]


def add_answer_record(session_id: str, question: str, answer: str, score_result: dict):
    session = get_session(session_id)
    session["question_answer_scores"].append({
        "question": question,
        "answer":   answer,
        **score_result
    })
