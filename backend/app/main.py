"""
FastAPI entry point — Interview Trainer Agent (full application).
Run with: uvicorn app.main:app --reload
"""

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from app.database import (
    create_db_and_tables, get_user_by_email, create_user,
    save_resume, get_resumes_for_user,
    create_interview_session, complete_interview_session, get_interview_history,
    delete_interview_session,
)
from app.auth import hash_password, verify_password, create_access_token, get_current_user, get_optional_user
from app.watsonx_client import granite_chat
from app.resume_parser import parse_resume
from app.rag.retriever import retrieve_relevant_chunks
from app.services.gap_analysis import analyze_gaps
from app.services.question_gen import generate_questions
from app.services.scoring import score_answer, generate_session_summary, generate_ideal_answer
from app.services.voice_scoring import transcribe_audio, compute_delivery_metrics
from app.services import session_state

app = FastAPI(title="Interview Trainer Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://pxvxzzfj-5173.inc1.devtunnels.ms",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    create_db_and_tables()   # fast — local SQLite only, no network calls
    # RAG index is built lazily on the first /start-session call.
    # This keeps server startup and auth endpoints instant.


@app.get("/")
def health_check():
    return {"status": "ok", "message": "Interview Trainer Agent backend is running."}


# ══════════════════════════════════════════════════════
# AUTH ENDPOINTS
# ══════════════════════════════════════════════════════

class RegisterRequest(BaseModel):
    email:    str
    username: str
    password: str


@app.post("/auth/register")
def register(request: RegisterRequest):
    if get_user_by_email(request.email):
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    if len(request.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")
    user = create_user(
        email=request.email,
        username=request.username,
        password_hash=hash_password(request.password),
    )
    token = create_access_token(user.id, user.email)
    return {"access_token": token, "token_type": "bearer",
            "user": {"id": user.id, "email": user.email, "username": user.username}}


class LoginRequest(BaseModel):
    email:    str
    password: str


@app.post("/auth/login")
def login(request: LoginRequest):
    user = get_user_by_email(request.email)
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    token = create_access_token(user.id, user.email)
    return {"access_token": token, "token_type": "bearer",
            "user": {"id": user.id, "email": user.email, "username": user.username}}


@app.get("/auth/me")
def me(current_user=Depends(get_current_user)):
    return {"id": current_user.id, "email": current_user.email, "username": current_user.username}


# ══════════════════════════════════════════════════════
# RESUME ENDPOINTS
# ══════════════════════════════════════════════════════

@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...),
                        current_user=Depends(get_optional_user)):
    file_bytes    = await file.read()
    extracted_text = parse_resume(file.filename, file_bytes)
    if current_user:
        save_resume(user_id=current_user.id, filename=file.filename,
                    extracted_text=extracted_text)
    return {"filename": file.filename, "extracted_text": extracted_text}


@app.get("/history/resumes")
def resume_history(current_user=Depends(get_current_user)):
    rows = get_resumes_for_user(current_user.id)
    return [{"id": r.id, "filename": r.filename,
             "preview": r.extracted_text[:300],
             "uploaded_at": r.uploaded_at.isoformat()} for r in rows]


# ══════════════════════════════════════════════════════
# CORE AGENT FLOW
# ══════════════════════════════════════════════════════

class StartSessionRequest(BaseModel):
    resume_text:   str
    job_role:      str
    job_description: Optional[str] = None
    track:         str = "mixed"      # technical | soft_skills | behavioral | mixed
    num_questions: int = 5


class StartSessionResponse(BaseModel):
    session_id:        str
    focus_areas:       list[str]
    identified_skills: list[str]
    reasoning:         str
    questions:         list[dict]


@app.post("/start-session", response_model=StartSessionResponse)
def start_session(request: StartSessionRequest,
                  current_user=Depends(get_optional_user)):
    job_description = request.job_description or ""
    gap_result   = analyze_gaps(resume_text=request.resume_text, job_role=request.job_role,
                                 track=request.track, job_description=job_description)
    focus_areas  = gap_result.get("focus_areas", [])

    questions = generate_questions(
        resume_text=request.resume_text,
        job_role=request.job_role,
        focus_areas=focus_areas,
        num_questions=request.num_questions,
        track=request.track,
        job_description=job_description,
    )

    session_id = session_state.create_session(
        job_role=request.job_role,
        resume_text=request.resume_text,
        focus_areas=focus_areas,
        user_id=current_user.id if current_user else None,
        track=request.track,
    )

    # Persist to DB (so history is saved even if page closes)
    if current_user:
        create_interview_session(
            user_id=current_user.id,
            session_uuid=session_id,
            job_role=request.job_role,
            track=request.track,
            focus_areas=focus_areas,
        )

    return StartSessionResponse(
        session_id=session_id,
        focus_areas=focus_areas,
        identified_skills=gap_result.get("identified_skills", []),
        reasoning=gap_result.get("reasoning", ""),
        questions=questions,
    )


class SubmitAnswerRequest(BaseModel):
    session_id:    str
    question_text: str
    answer_text:   str


@app.post("/submit-answer")
def submit_answer(request: SubmitAnswerRequest):
    try:
        session = session_state.get_session(request.session_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Session not found.")

    score_result = score_answer(
        question_text=request.question_text,
        answer_text=request.answer_text,
        job_role=session["job_role"],
        track=session.get("track", "mixed"),
    )
    session_state.add_answer_record(
        session_id=request.session_id,
        question=request.question_text,
        answer=request.answer_text,
        score_result=score_result,
    )
    return score_result


@app.post("/submit-voice-answer")
async def submit_voice_answer(
    session_id: str = Form(...),
    question_text: str = Form(...),
    audio: UploadFile = File(...),
):
    try:
        session = session_state.get_session(session_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Session not found.")

    audio_bytes = await audio.read()
    content_type = audio.content_type or "audio/webm"

    try:
        transcription = transcribe_audio(audio_bytes, content_type=content_type)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))

    transcript = transcription["transcript"]
    if not transcript.strip():
        raise HTTPException(status_code=422, detail="Could not detect any speech in that recording — try again.")

    delivery = compute_delivery_metrics(
        transcript=transcript,
        words=transcription["words"],
        duration=transcription["duration"],
    )

    # Score the *content* of the transcribed answer exactly like a typed answer.
    content_score = score_answer(
        question_text=question_text,
        answer_text=transcript,
        job_role=session["job_role"],
        track=session.get("track", "mixed"),
    )

    combined = {
        **content_score,
        "delivery_score":    delivery["delivery_score"],
        "wpm":               delivery["wpm"],
        "filler_count":      delivery["filler_count"],
        "longest_pause":     delivery["longest_pause"],
        "feedback":          content_score["feedback"] + " " + delivery["delivery_feedback"],
        "transcript":        transcript,
    }

    session_state.add_answer_record(
        session_id=session_id,
        question=question_text,
        answer=transcript,
        score_result=combined,
    )
    return combined


class IdealAnswerRequest(BaseModel):
    session_id:    str
    question_text: str


@app.post("/ideal-answer")
def ideal_answer(request: IdealAnswerRequest):
    try:
        session = session_state.get_session(request.session_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Session not found.")
    answer = generate_ideal_answer(
        question_text=request.question_text,
        job_role=session["job_role"],
        track=session.get("track", "mixed"),
    )
    return {"ideal_answer": answer}


class EndSessionRequest(BaseModel):
    session_id: str


@app.post("/end-session")
def end_session(request: EndSessionRequest):
    try:
        session = session_state.get_session(request.session_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Session not found.")
    if not session["question_answer_scores"]:
        raise HTTPException(status_code=400, detail="No answers recorded yet.")

    summary = generate_session_summary(
        job_role=session["job_role"],
        question_answer_scores=session["question_answer_scores"],
        track=session.get("track", "mixed"),
    )

    # Persist completed session to DB
    complete_interview_session(
        session_uuid=request.session_id,
        summary=summary,
        qa_log=session["question_answer_scores"],
    )

    return summary


# ══════════════════════════════════════════════════════
# HISTORY ENDPOINT
# ══════════════════════════════════════════════════════

@app.get("/history/interviews")
def interview_history(current_user=Depends(get_current_user)):
    return get_interview_history(current_user.id)


@app.delete("/history/interviews/{session_id}")
def delete_interview(session_id: int, current_user=Depends(get_current_user)):
    deleted = delete_interview_session(user_id=current_user.id, session_id=session_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Interview session not found")
    return {"deleted": True, "id": session_id}


# ══════════════════════════════════════════════════════
# DEBUG
# ══════════════════════════════════════════════════════

class ChatTestRequest(BaseModel):
    message: str


@app.post("/test-chat")
def test_chat(request: ChatTestRequest):
    reply = granite_chat(messages=[{"role": "user", "content": request.message}])
    return {"reply": reply}
