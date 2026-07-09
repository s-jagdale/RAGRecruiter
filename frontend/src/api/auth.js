import apiClient from "./client";

// POST /auth/register -> {access_token, token_type, user}
export async function registerUser({ email, username, password }) {
  const { data } = await apiClient.post("/auth/register", { email, username, password });
  return data;
}

// POST /auth/login -> {access_token, token_type, user}
export async function loginUser({ email, password }) {
  const { data } = await apiClient.post("/auth/login", { email, password });
  return data;
}

// GET /auth/me -> {id, email, username}
export async function fetchCurrentUser() {
  const { data } = await apiClient.get("/auth/me");
  return data;
}
