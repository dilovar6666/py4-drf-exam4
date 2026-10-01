import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/";
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";
export const WS_URL = BACKEND_URL.replace(/^http/, "ws");

const api = axios.create({ baseURL: API_URL, timeout: 15000 });
let refreshPromise = null;

export function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

export function storeTokens({ access, refresh }) {
  if (access) localStorage.setItem("access_token", access);
  if (refresh) localStorage.setItem("refresh_token", refresh);
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const refresh = localStorage.getItem("refresh_token");
    const isAuthRequest = original?.url?.startsWith("auth/");

    if (error.response?.status !== 401 || original?._retry || !refresh || isAuthRequest) {
      return Promise.reject(error);
    }

    original._retry = true;
    try {
      refreshPromise ||= axios.post(`${API_URL}auth/refresh/`, { refresh });
      const { data } = await refreshPromise;
      storeTokens(data);
      original.headers.Authorization = `Bearer ${data.access}`;
      return api(original);
    } catch (refreshError) {
      clearTokens();
      window.dispatchEvent(new Event("auth:expired"));
      return Promise.reject(refreshError);
    } finally {
      refreshPromise = null;
    }
  },
);

export function mediaUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${BACKEND_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function apiErrorMessage(error, fallback = "Произошла ошибка. Попробуйте ещё раз.") {
  const data = error.response?.data;
  if (typeof data === "string") return data;
  if (data?.detail) return data.detail;
  if (data && typeof data === "object") {
    const first = Object.values(data)[0];
    if (Array.isArray(first)) return first[0];
    if (typeof first === "string") return first;
  }
  return fallback;
}

export default api;
