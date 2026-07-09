import apiClient from "./client";


export async function startSession({ resumeText, jobRole, jobDescription, track, numQuestions = 5 }) {
  const { data } = await apiClient.post("/start-session", {
    resume_text: resumeText,
    job_role: jobRole,
    job_description: jobDescription || undefined,
    track,
    num_questions: numQuestions,
  });
  return data;
}


export async function submitAnswer({ sessionId, questionText, answerText }) {
  const { data } = await apiClient.post("/submit-answer", {
    session_id: sessionId,
    question_text: questionText,
    answer_text: answerText,
  });
  return data;
}

// POST /submit-voice-answer (multipart)
// -> {clarity_score, relevance_score, depth_score, feedback, delivery_score, wpm,
//     filler_count, longest_pause, transcript}
export async function submitVoiceAnswer({ sessionId, questionText, audioBlob }) {
  const formData = new FormData();
  formData.append("session_id", sessionId);
  formData.append("question_text", questionText);
  formData.append("audio", audioBlob, "answer.webm");
  const { data } = await apiClient.post("/submit-voice-answer", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

// POST /ideal-answer -> {ideal_answer}
export async function fetchIdealAnswer({ sessionId, questionText }) {
  const { data } = await apiClient.post("/ideal-answer", {
    session_id: sessionId,
    question_text: questionText,
  });
  return data;
}

// POST /end-session -> {readiness_score, strengths, gaps, recommendations}
export async function endSession({ sessionId }) {
  const { data } = await apiClient.post("/end-session", { session_id: sessionId });
  return data;
}
