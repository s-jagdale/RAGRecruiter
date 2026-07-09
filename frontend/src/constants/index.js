export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  TRACK_SELECTION: "/interview/track",
  INTERVIEW_SETUP: "/interview/setup",
  INTERVIEW_SCREEN: "/interview/session",
  INTERVIEW_RESULT: "/interview/result",
  HISTORY: "/history",
  ANALYTICS: "/analytics",
  PROFILE: "/profile",
  SETTINGS: "/settings",
  ABOUT: "/about",
};

// Interview tracks — mirrors the `track` values the backend accepts
// (see gap_analysis.py / question_gen.py / scoring.py _*_GUIDANCE dicts).
export const TRACKS = [
  {
    id: "technical",
    label: "Technical",
    description: "Master coding, system design, and technical concepts through practice and detailed feedback.",
  },
  {
    id: "soft_skills",
    label: "Soft Skills",
    description: "Improve communication, leadership, teamwork, and workplace collaboration through realistic interviews.",
  },
  {
    id: "behavioral",
    label: "Behavioral",
    description: "Practice STAR-based behavioral questions to confidently showcase your experiences and achievements.",
  },
  {
    id: "mixed",
    label: "Mixed / Full Prep",
    description: "Experience a complete mock interview combining technical and soft-skills questions with personalized feedback.",
  },
];

// The 7 roles the backend's knowledge base has curated content for
// (see rag/knowledge_base.py). Anything outside this list still works,
// it just falls back to generic "general" questions.
export const CURATED_ROLES = [
  { value: "software_engineer", label: "Software Engineer" },
  { value: "data_analyst", label: "Data Analyst / Data Scientist" },
  { value: "devops_engineer", label: "DevOps Engineer" },
  { value: "qa_engineer", label: "QA / Test Engineer" },
  { value: "cybersecurity_analyst", label: "Cybersecurity Analyst" },
  { value: "cloud_engineer", label: "Cloud Engineer" },
  { value: "it_support", label: "IT Support / Helpdesk" },
];

export const AUTH_TOKEN_KEY = "ragrecruiter_token";
export const AUTH_USER_KEY = "ragrecruiter_user";
