import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";

// Backend URL (override with VITE_API_URL when deploying).
// Empty in development: requests go through the Vite proxy (/api -> localhost:3000).
const API_BASE_URL = import.meta.env.VITE_API_URL || "";

// Keep the token in memory (RAM), not localStorage, to stay safe from XSS
let inMemoryAccessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  inMemoryAccessToken = token;
};

export const getAccessToken = () => inMemoryAccessToken;

// Main axios instance used across the app
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // required so the browser sends the refreshToken cookie
});

// Request Interceptor: attach the 'Authorization: Bearer <token>' header automatically
apiClient.interceptors.request.use((config) => {
  if (inMemoryAccessToken && config.headers) {
    config.headers.Authorization = `Bearer ${inMemoryAccessToken}`;
  }
  return config;
});

// Handles many concurrent 401s when the access token expires
type FailedRequest = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

type RetriableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

// Re-run requests that were queued while waiting for the refresh
const processQueue = (error: unknown | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: on 401, silently attempt a token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequest | undefined;

    // 401 and this is not already a retry
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Never retry the login/refresh endpoints themselves
      if (
        originalRequest.url?.includes("/api/v1/auth/login") ||
        originalRequest.url?.includes("/api/v1/auth/refresh")
      ) {
        return Promise.reject(error);
      }

      // A refresh is already in flight: queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            },
            reject: (err: unknown) => {
              reject(err);
            },
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call the refresh endpoint (the HttpOnly cookie is sent automatically)
        const response = await axios.post(
          `${API_BASE_URL}/api/v1/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = response.data.data.accessToken as string;
        setAccessToken(newAccessToken);

        // Release all queued requests with the new token
        processQueue(null, newAccessToken);

        // Retry the original request that failed with 401
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (err) {
        // Refresh failed too (e.g. the 7-day refresh token expired): full logout
        processQueue(err, null);
        setAccessToken(null);

        window.dispatchEvent(new Event("auth:unauthorized"));
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
