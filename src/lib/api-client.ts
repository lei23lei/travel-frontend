import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

// Constants
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const TOKEN_COOKIE_NAME = "travel_auth_token";

// Token management utilities
export const tokenManager = {
  getToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return Cookies.get(TOKEN_COOKIE_NAME) || null;
  },

  setToken: (token: string): void => {
    if (typeof window === "undefined") return;
    Cookies.set(TOKEN_COOKIE_NAME, token, {
      expires: 7, // 7 days
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  },

  removeToken: (): void => {
    if (typeof window === "undefined") return;
    Cookies.remove(TOKEN_COOKIE_NAME);
  },

  isAuthenticated: (): boolean => {
    return !!tokenManager.getToken();
  },
};

// Create the main HTTP client with automatic token attachment
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor to add token to headers
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = tokenManager.getToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle token expiration
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token expired or invalid
        tokenManager.removeToken();
        // Optionally redirect to login page
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    }
  );

  return client;
};

// Export the configured API client
export const apiClient = createApiClient();

// Utility functions for common API patterns
export const apiUtils = {
  // Handle API response and extract data
  handleResponse: <T>(response: { data: T }): T => {
    return response.data;
  },

  // Handle API errors consistently
  handleError: (error: any): never => {
    if (error.response?.data) {
      throw new Error(
        error.response.data.message ||
          error.response.data.detail?.message ||
          "API request failed"
      );
    }
    throw new Error("Network error occurred");
  },
};

// Export default as the main API client
export default apiClient;
