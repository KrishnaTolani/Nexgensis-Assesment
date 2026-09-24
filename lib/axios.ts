import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://dummyjson.com";

// Create one shared axios instance — all API calls use this
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// REQUEST INTERCEPTOR
// Runs before every request — attaches the auth token if it exists in localStorage
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // localStorage is only available in the browser (not during SSR)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// RESPONSE INTERCEPTOR
// Runs after every response — handles errors in one central place
axiosInstance.interceptors.response.use(
  (response) => {
    // Success: just pass the response through
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        // Token expired or invalid — clear storage and redirect to login
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("auth_user");
          // Only redirect if not already on login page
          if (!window.location.pathname.includes("/login")) {
            window.location.href = "/login";
          }
        }
      }

      if (status === 404) {
        // Let the caller handle 404 (e.g. show "not found" page)
        return Promise.reject(error);
      }

      if (status >= 500) {
        // Server error — caller can show a generic retry message
        return Promise.reject(error);
      }
    } else if (error.code === "ERR_CANCELED") {
      // Request was aborted (race condition prevention) — not an actual error
      return Promise.reject(error);
    } else if (error.code === "ECONNABORTED") {
      // Timeout
      return Promise.reject(new Error("Request timed out. Please try again."));
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
