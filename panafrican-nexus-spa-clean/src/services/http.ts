// Client HTTP axios + intercepteurs JWT (auto-refresh sur 401)

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { tokenStorage } from "./tokenStorage";
import type { AuthResponse } from "../types/auth";

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? "http://localhost:5600/api";

export const http: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// --- Request: injection du Bearer ---
http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getAccess();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Response: refresh automatique en cas de 401 ---
let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

const processQueue = (token: string | null) => {
  pendingQueue.forEach((cb) => cb(token));
  pendingQueue = [];
};

// Notifie l'app React que la session est définitivement expirée
function emitSessionExpired() {
  tokenStorage.clear();
  window.dispatchEvent(new CustomEvent("auth:session-expired"));
}

http.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Ne tente pas le refresh sur les routes publiques ou si déjà tenté
    if (!original || error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    // Pas de refresh token → session expirée immédiatement
    const refreshToken = tokenStorage.getRefresh();
    if (!refreshToken) {
      emitSessionExpired();
      return Promise.reject(error);
    }

    // Un refresh est déjà en cours → mettre en file d'attente
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push((token) => {
          if (!token) return reject(error);
          original.headers!.Authorization = `Bearer ${token}`;
          resolve(http(original));
        });
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post<AuthResponse>(
        `${API_BASE_URL}/auth/refresh`,
        { refreshToken },
        { headers: { "Content-Type": "application/json" } },
      );
      tokenStorage.set(data.accessToken, data.refreshToken);
      processQueue(data.accessToken);
      original.headers!.Authorization = `Bearer ${data.accessToken}`;
      return http(original);
    } catch {
      // Refresh token également invalide/expiré → session terminée
      processQueue(null);
      emitSessionExpired();
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  },
);
