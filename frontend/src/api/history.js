import apiClient from "./client";

// GET /history/interviews (requires auth)
// -> [{id, session_uuid, job_role, track, focus_areas, readiness_score, summary, qa_log, started_at, completed_at}]
export async function fetchInterviewHistory() {
  const { data } = await apiClient.get("/history/interviews");
  return data;
}

// DELETE /history/interviews/{id} (requires auth) -> {deleted: true, id}
export async function deleteInterviewSession(sessionId) {
  const { data } = await apiClient.delete(`/history/interviews/${sessionId}`);
  return data;
}
