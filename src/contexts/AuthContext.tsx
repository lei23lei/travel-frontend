"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { authAPI, tokenManager } from "@/services/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    checkAuthStatus();

    // Listen for OAuth success messages from popup windows
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "OAUTH_SUCCESS" && event.data.token) {
        tokenManager.setToken(event.data.token);
        checkAuthStatus();
      } else if (event.data.type === "OAUTH_ERROR") {
        setError(event.data.error);
        setLoading(false);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      if (!tokenManager.isAuthenticated()) {
        setUser(null);
        setLoading(false);
        return;
      }

      const userData = await authAPI.getCurrentUser();
      if (userData) {
        setUser(userData as UserResponse);
      } else {
        setUser(null);
        tokenManager.removeToken();
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      tokenManager.removeToken();
      setError("Failed to verify authentication");
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    await checkAuthStatus();
  };

  const loginWithGitHub = () => {
    setError(null);
    setLoading(true);

    // Open OAuth in a popup window
    const popup = window.open(
      `${API_URL}/auth/github`,
      "github-oauth",
      "width=600,height=700,scrollbars=yes,resizable=yes"
    );

    // Monitor the popup
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed);
        setLoading(false);
      }
    }, 1000);
  };

  const loginWithGoogle = () => {
    setError(null);
    setLoading(true);

    // Open OAuth in a popup window
    const popup = window.open(
      `${API_URL}/auth/google`,
      "google-oauth",
      "width=600,height=700,scrollbars=yes,resizable=yes"
    );

    // Monitor the popup
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed);
        setLoading(false);
      }
    }, 1000);
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);

      const response = await authAPI.login({ email, password });
      if (response.status === "success" && response.data) {
        setUser(response.data.user as UserResponse);
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);

      const response = await authAPI.register({ email, password });
      if (response.status === "success" && response.data) {
        setUser(response.data.user as UserResponse);
      } else {
        throw new Error(response.message || "Registration failed");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Registration failed";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authAPI.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
      tokenManager.removeToken();
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    loginWithGitHub,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    logout,
    clearError,
    isAuthenticated: !!user,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
