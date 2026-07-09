# RAGRecruiter

An AI mock-interview platform: upload a resume, pick a role and track, get a
tailored question set, answer by text or voice, and receive AI-scored
feedback plus a final readiness report.

This delivery has two folders:

```
ragrecruiter-backend/    the FastAPI app, reassembled from your uploaded files
ragrecruiter-frontend/   the React 19 + Vite app built against it
```

## Running it

**Backend**
```bash
cd ragrecruiter-backend
python -m venv venv && source venv/bin/activate   # or venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env   # then fill in your watsonx.ai (and optionally STT) credentials
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**Frontend**
```bash
cd ragrecruiter-frontend
npm install
cp .env.example .env   # defaults to http://127.0.0.1:8000, change if needed
npm run dev
```
Then open the printed local URL (default `http://localhost:5173`).

## What's implemented

Every page from the build brief exists and is wired to a real backend
endpoint — no mock/hardcoded data anywhere:

| Page | Backend calls |
|---|---|
| Landing | — (static, matches the PDF) |
| Login / Register | `/auth/login`, `/auth/register` |
| Dashboard | `/history/interviews` (composed client-side — no dedicated dashboard endpoint exists) |
| Track Selection | client-side only |
| Interview Setup | `/upload-resume`, `/start-session` |
| Interview Screen | `/submit-answer`, `/submit-voice-answer`, `/ideal-answer` |
| Interview Result | `/end-session` |
| History | `/history/interviews`, `DELETE /history/interviews/{id}` |
| Analytics | aggregated client-side from `/history/interviews` |
| Profile | `/auth/me`, `/history/resumes` (read-only) |
| Settings | local device preferences only (no backend support exists) |
| About | static |

The guest flow works too — `/upload-resume` and `/start-session` both accept
requests with or without a logged-in user (`get_optional_user` on the
backend), so someone can practice a full interview without an account; it
just won't be saved to History.

## Known gaps carried over from the backend analysis

These were flagged before building and intentionally **not** silently
papered over in the UI — each shows an honest in-app note instead of fake
functionality:

1. **No job-description field on `/start-session`.** The Setup page lets
   you paste one and stores it in session state, but it isn't sent to the
   backend yet — the UI says so directly under the field.
2. **No Analytics endpoint.** The Analytics page computes everything
   (readiness trend, per-track averages, common gaps) in the browser from
   `/history/interviews`. Fine for correctness, but it means analytics
   recompute on every load rather than being pre-aggregated.
3. **No Profile/Settings update endpoints.** Profile is read-only; Settings
   toggles are stored on-device only (not synced across browsers/devices).
4. **Job role field:** since the RAG knowledge base only has curated
   content for 7 roles (see `app/rag/knowledge_base.py`), Setup offers those
   7 as a dropdown plus a free-text "Other" option, so users aren't limited
   but get the tailored experience by default.
5. **In-memory sessions:** an in-progress interview lives in server memory
   (`app/services/session_state.py`) until `/end-session` is called. If the
   backend restarts mid-interview, `/submit-answer` will 404 — the frontend
   doesn't yet special-case that 404 with a friendly redirect; it currently
   surfaces as a toast error. Worth hardening before production.
6. **Fixed one backend gap directly:** `requirements.txt` was missing
   `ibm-watson` / `ibm-cloud-sdk-core`, which `voice_scoring.py` imports —
   without it the voice-answer endpoint would crash at import time instead
   of degrading gracefully. Added both packages; no other backend logic was
   changed.
7. **`/test-chat`** (raw Granite passthrough) is intentionally not called
   anywhere in the frontend.

## Design note

Only the Landing Page had a PDF export. Every other screen was built using
the Landing Page's own design system (color tokens, type scale, card and
button styles — see `tailwind.config.js`) extended consistently, rather than
inventing an unrelated look. If real designs for those screens exist, the
easiest path is swapping page-level markup — the component library
(Button, Card, Input, Select, Badge, Modal, etc.) and API layer underneath
won't need to change.
