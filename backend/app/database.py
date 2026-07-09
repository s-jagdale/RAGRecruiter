"""
SQLite database models using SQLModel (SQLAlchemy + Pydantic).

Tables:
  - users            — registered accounts
  - resume_uploads   — every resume a user has uploaded
  - interview_sessions — completed interview sessions with summary + Q&A log
"""

import json
from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel, create_engine, Session, select

DATABASE_URL = "sqlite:///./interview_agent.db"
engine = create_engine(DATABASE_URL, echo=False)


# ─── Models ────────────────────────────────────────────────────────────────────

class User(SQLModel, table=True):
    id:            Optional[int] = Field(default=None, primary_key=True)
    email:         str           = Field(unique=True, index=True)
    username:      str
    password_hash: str
    created_at:    datetime      = Field(default_factory=datetime.utcnow)


class ResumeUpload(SQLModel, table=True):
    id:           Optional[int] = Field(default=None, primary_key=True)
    user_id:      int           = Field(foreign_key="user.id", index=True)
    filename:     str
    extracted_text: str
    uploaded_at:  datetime      = Field(default_factory=datetime.utcnow)


class InterviewSession(SQLModel, table=True):
    id:              Optional[int] = Field(default=None, primary_key=True)
    user_id:         int           = Field(foreign_key="user.id", index=True)
    session_uuid:    str           = Field(index=True)   # maps to in-memory session key
    job_role:        str
    track:           str           = "technical"         # "technical" | "soft_skills" | "behavioral" | "mixed"
    focus_areas_json: str          = "[]"                # JSON-encoded list[str]
    readiness_score:  Optional[int] = None
    summary_json:     Optional[str] = None               # full summary dict as JSON
    qa_log_json:      Optional[str] = None               # full answered log as JSON
    completed:        bool          = False
    started_at:       datetime      = Field(default_factory=datetime.utcnow)
    completed_at:     Optional[datetime] = None


# ─── DB helpers ────────────────────────────────────────────────────────────────

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session


# ─── User CRUD ─────────────────────────────────────────────────────────────────

def create_user(email: str, username: str, password_hash: str) -> User:
    with Session(engine) as db:
        user = User(email=email, username=username, password_hash=password_hash)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user


def get_user_by_email(email: str) -> Optional[User]:
    with Session(engine) as db:
        return db.exec(select(User).where(User.email == email)).first()


def get_user_by_id(user_id: int) -> Optional[User]:
    with Session(engine) as db:
        return db.get(User, user_id)


# ─── Resume CRUD ───────────────────────────────────────────────────────────────

def save_resume(user_id: int, filename: str, extracted_text: str) -> ResumeUpload:
    with Session(engine) as db:
        row = ResumeUpload(user_id=user_id, filename=filename, extracted_text=extracted_text)
        db.add(row)
        db.commit()
        db.refresh(row)
        return row


def get_resumes_for_user(user_id: int) -> list[ResumeUpload]:
    with Session(engine) as db:
        return list(db.exec(
            select(ResumeUpload).where(ResumeUpload.user_id == user_id)
            .order_by(ResumeUpload.uploaded_at.desc())
        ).all())


# ─── Interview session CRUD ────────────────────────────────────────────────────

def create_interview_session(user_id: int, session_uuid: str, job_role: str,
                              track: str, focus_areas: list[str]) -> InterviewSession:
    with Session(engine) as db:
        row = InterviewSession(
            user_id=user_id,
            session_uuid=session_uuid,
            job_role=job_role,
            track=track,
            focus_areas_json=json.dumps(focus_areas),
        )
        db.add(row)
        db.commit()
        db.refresh(row)
        return row


def complete_interview_session(session_uuid: str, summary: dict, qa_log: list[dict]):
    with Session(engine) as db:
        row = db.exec(
            select(InterviewSession).where(InterviewSession.session_uuid == session_uuid)
        ).first()
        if row:
            row.readiness_score = summary.get("readiness_score")
            row.summary_json    = json.dumps(summary)
            row.qa_log_json     = json.dumps(qa_log)
            row.completed       = True
            row.completed_at    = datetime.utcnow()
            db.add(row)
            db.commit()


def get_interview_history(user_id: int) -> list[dict]:
    with Session(engine) as db:
        rows = list(db.exec(
            select(InterviewSession)
            .where(InterviewSession.user_id == user_id, InterviewSession.completed == True)
            .order_by(InterviewSession.completed_at.desc())
        ).all())
        result = []
        for r in rows:
            result.append({
                "id":             r.id,
                "session_uuid":   r.session_uuid,
                "job_role":       r.job_role,
                "track":          r.track,
                "focus_areas":    json.loads(r.focus_areas_json),
                "readiness_score": r.readiness_score,
                "summary":        json.loads(r.summary_json) if r.summary_json else None,
                "qa_log":         json.loads(r.qa_log_json) if r.qa_log_json else None,
                "started_at":     r.started_at.isoformat(),
                "completed_at":   r.completed_at.isoformat() if r.completed_at else None,
            })
        return result


def delete_interview_session(user_id: int, session_id: int) -> bool:
    """
    Deletes a single interview session from history, scoped to the owning user
    so one user can never delete another user's record. Returns True if a row
    was deleted, False if no matching row was found (already gone or not theirs).
    """
    with Session(engine) as db:
        row = db.exec(
            select(InterviewSession).where(
                InterviewSession.id == session_id,
                InterviewSession.user_id == user_id,
            )
        ).first()
        if not row:
            return False
        db.delete(row)
        db.commit()
        return True
