import apiClient from "./client";

// POST /upload-resume (multipart) -> {filename, extracted_text}
// Works with or without auth — get_optional_user on the backend.
export async function uploadResume(file) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiClient.post("/upload-resume", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

// GET /history/resumes -> [{id, filename, preview, uploaded_at}]  (requires auth)
export async function fetchResumeHistory() {
  const { data } = await apiClient.get("/history/resumes");
  return data;
}
