import axios from "axios";

// --- Axios instance ---
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

// --- Helper to attach JWT ---
const attachToken = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// --- Auth routes ---
export const login = (data) => api.post("/api/auth/login", data);
export const createTeam = (data) => api.post("/api/auth/create-team", data);
export const createAdmin = (data) => api.post("/api/auth/create-admin", data);
export const loginUser = (data) => api.post("/api/auth/login-user", data);

// --- User routes ---
export const createUser = (data, token) =>
  api.post("/api/users/create", data, attachToken(token));

export const getUsersByTeam = (token) =>
  api.get("/api/users/by-team", attachToken(token));

// --- Question routes ---
export const createQuestion = (data, token) =>
  api.post("/api/questions/create", data, attachToken(token));

export const getQuestions = (token) =>
  api.get("/api/questions", attachToken(token));

// --- Submission routes ---
export const submitFlag = (data, token) =>
  api.post("/api/submissions/submit", data, attachToken(token));

export const getAllSubmissions = (token) =>
  api.get("/api/submissions/log", attachToken(token));

export default api;
