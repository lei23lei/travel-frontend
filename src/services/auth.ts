import {
  apiClient,
  tokenManager as apiTokenManager,
  apiUtils,
} from "@/lib/api-client";

// Types based on backend schemas
export interface UserResponse {
  id: number;
  provider_id: string | null;
  username: string | null;
  email: string;
  avatar_url: string | null;
  name: string | null;
  provider: string | null;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: UserResponse;
}

export interface APIResponse<T = any> {
  status: "success" | "fail";
  message: string;
  data: T | null;
}

export interface UserCreate {
  email: string;
  password: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface UserUpdate {
  name: string;
}

// Re-export token manager from api-client for convenience
export const tokenManager = apiTokenManager;

// Re-export the HTTP client for backward compatibility
export const httpClient = apiClient;

// Auth API functions
export const authAPI = {
  register: async (
    userData: UserCreate
  ): Promise<APIResponse<TokenResponse>> => {
    try {
      const response = await apiClient.post<APIResponse<TokenResponse>>(
        "/auth/register",
        userData
      );

      if (response.data.status === "success" && response.data.data) {
        // Store token on successful registration
        tokenManager.setToken(response.data.data.access_token);
      }

      return response.data;
    } catch (error: any) {
      return apiUtils.handleError(error);
    }
  },

  login: async (
    credentials: UserLogin
  ): Promise<APIResponse<TokenResponse>> => {
    try {
      const response = await apiClient.post<APIResponse<TokenResponse>>(
        "/auth/login",
        credentials
      );

      if (response.data.status === "success" && response.data.data) {
        // Store token on successful login
        tokenManager.setToken(response.data.data.access_token);
      }

      return response.data;
    } catch (error: any) {
      return apiUtils.handleError(error);
    }
  },

  logout: async (): Promise<APIResponse> => {
    try {
      const response = await apiClient.post<APIResponse>("/auth/logout");

      // Remove token regardless of API response
      tokenManager.removeToken();

      return response.data;
    } catch (error: any) {
      // Remove token even if API call fails
      tokenManager.removeToken();
      return apiUtils.handleError(error);
    }
  },

  getCurrentUser: async (): Promise<UserResponse | null> => {
    if (!tokenManager.isAuthenticated()) {
      return null;
    }

    try {
      // This endpoint would need to be implemented in your backend
      const response = await apiClient.get<APIResponse<UserResponse>>(
        "/auth/me"
      );

      if (response.data.status === "success" && response.data.data) {
        return response.data.data;
      }

      return null;
    } catch (error: any) {
      console.error("Failed to get current user:", error);
      return null;
    }
  },

  forgotPassword: async (
    request: ForgotPasswordRequest
  ): Promise<APIResponse> => {
    try {
      const response = await apiClient.post<APIResponse>(
        "/auth/forgot-password",
        request
      );

      return response.data;
    } catch (error: any) {
      return apiUtils.handleError(error);
    }
  },

  resetPassword: async (
    request: ResetPasswordRequest
  ): Promise<APIResponse> => {
    try {
      const response = await apiClient.post<APIResponse>(
        "/auth/reset-password",
        request
      );

      return response.data;
    } catch (error: any) {
      return apiUtils.handleError(error);
    }
  },

  updateUserProfile: async (
    userUpdate: UserUpdate
  ): Promise<APIResponse<UserResponse>> => {
    try {
      const response = await apiClient.patch<APIResponse<UserResponse>>(
        "/auth/me",
        userUpdate
      );

      return response.data;
    } catch (error: any) {
      return apiUtils.handleError(error);
    }
  },
};

// Auth utilities
export const authUtils = {
  isAuthenticated: tokenManager.isAuthenticated,
  getToken: tokenManager.getToken,
  logout: () => {
    tokenManager.removeToken();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  },
};
