"""
Voice-answer delivery scoring.

Pipeline:
  1. Transcribe the candidate's recorded audio via IBM Watson Speech to Text,
     requesting word-level timestamps.
  2. From the transcript + timestamps, compute objective delivery metrics:
       - speaking pace (words per minute)
       - filler word count ("um", "uh", "like", "you know", etc.)
       - longest pause between words
  3. Turn those metrics into a 1-5 delivery_score with plain-language feedback,
     the same shape as the existing clarity/relevance/depth scores so the
     frontend and session summary can treat it as just another dimension.

This is intentionally separate from scoring.py: scoring.py judges the
*content* of an answer (via Granite), this module judges *how it was said*
(via objective audio-derived metrics — no LLM call needed here at all).
"""

import re
from ibm_watson import SpeechToTextV1
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator

from app import config

# ── Lazy singleton client (same pattern as watsonx_client.py) ───────────────
_stt_client = None


def _get_stt_client() -> SpeechToTextV1:
    global _stt_client
    if _stt_client is None:
        if not config.STT_API_KEY or not config.STT_URL:
            raise RuntimeError(
                "Speech to Text is not configured — set STT_API_KEY and STT_URL "
                "in your .env file to use the voice-answer feature."
            )
        authenticator = IAMAuthenticator(config.STT_API_KEY)
        client = SpeechToTextV1(authenticator=authenticator)
        client.set_service_url(config.STT_URL)
        _stt_client = client
    return _stt_client


FILLER_WORDS = {
    "um", "uh", "umm", "uhh", "erm", "hmm",
    "like", "basically", "actually", "literally",
    "so", "you know", "i mean", "kind of", "sort of",
}

# Ideal speaking pace range for a clear, confident interview answer.
IDEAL_WPM_MIN = 120
IDEAL_WPM_MAX = 165


def transcribe_audio(audio_bytes: bytes, content_type: str = "audio/webm") -> dict:
    """
    Sends the recorded audio to Watson Speech to Text and returns:
      {"transcript": str, "words": [(word, start_time, end_time), ...], "duration": float}
    """
    client = _get_stt_client()

    result = client.recognize(
        audio=audio_bytes,
        content_type=content_type,
        model="en-US_BroadbandModel",
        timestamps=True,
        word_confidence=False,
        smart_formatting=True,
    ).get_result()

    transcript_parts = []
    all_words = []

    for chunk in result.get("results", []):
        alt = chunk.get("alternatives", [{}])[0]
        transcript_parts.append(alt.get("transcript", "").strip())
        for word, start, end in alt.get("timestamps", []):
            all_words.append((word, float(start), float(end)))

    transcript = " ".join(p for p in transcript_parts if p)
    duration = all_words[-1][2] if all_words else 0.0

    return {"transcript": transcript, "words": all_words, "duration": duration}


def _count_filler_words(transcript: str) -> int:
    text = transcript.lower()
    count = 0
    for filler in FILLER_WORDS:
        # word-boundary match so "like" doesn't match inside "likely"
        count += len(re.findall(rf"\b{re.escape(filler)}\b", text))
    return count


def _longest_pause(words: list[tuple]) -> float:
    if len(words) < 2:
        return 0.0
    longest = 0.0
    for i in range(1, len(words)):
        gap = words[i][1] - words[i - 1][2]  # this word's start - previous word's end
        if gap > longest:
            longest = gap
    return round(longest, 2)


def compute_delivery_metrics(transcript: str, words: list[tuple], duration: float) -> dict:
    """
    Returns:
      {"wpm": float, "filler_count": int, "longest_pause": float,
       "delivery_score": int (1-5), "delivery_feedback": str}
    """
    word_count = len(words) if words else len(transcript.split())
    wpm = round((word_count / duration) * 60, 1) if duration > 0 else 0.0
    filler_count = _count_filler_words(transcript)
    longest_pause = _longest_pause(words)

    # ── Score the delivery on a simple, transparent 1-5 rubric ──
    score = 5
    notes = []

    if wpm == 0:
        score = 1
        notes.append("no clear speech was detected")
    else:
        if wpm < IDEAL_WPM_MIN - 30 or wpm > IDEAL_WPM_MAX + 40:
            score -= 2
            notes.append(f"pace was {'too slow' if wpm < IDEAL_WPM_MIN else 'too fast'} ({wpm} WPM)")
        elif wpm < IDEAL_WPM_MIN or wpm > IDEAL_WPM_MAX:
            score -= 1
            notes.append(f"pace was slightly {'slow' if wpm < IDEAL_WPM_MIN else 'fast'} ({wpm} WPM)")
        else:
            notes.append(f"pace was in a strong range ({wpm} WPM)")

        if filler_count >= 6:
            score -= 2
            notes.append(f"{filler_count} filler words ('um', 'like', etc.) — noticeably distracting")
        elif filler_count >= 3:
            score -= 1
            notes.append(f"{filler_count} filler words — a bit distracting")
        else:
            notes.append("minimal filler words")

        if longest_pause >= 4:
            score -= 1
            notes.append(f"a {longest_pause}s pause suggests hesitation")

    score = max(1, min(5, score))
    feedback = "Delivery: " + "; ".join(notes) + "."

    return {
        "wpm": wpm,
        "filler_count": filler_count,
        "longest_pause": longest_pause,
        "delivery_score": score,
        "delivery_feedback": feedback,
    }
