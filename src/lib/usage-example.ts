// Usage examples for the centralized API client

import { apiClient, tokenManager, apiUtils } from "@/lib/api-client";
import { APIResponse } from "@/services/auth";

// Example 1: Simple authenticated API call
export const fetchUserProfile = async () => {
  try {
    const response = await apiClient.get<APIResponse<any>>("/user/profile");
    return response.data;
  } catch (error: any) {
    return apiUtils.handleError(error);
  }
};

// Example 2: POST request with data
export const createPost = async (postData: {
  title: string;
  content: string;
}) => {
  try {
    const response = await apiClient.post<APIResponse<any>>("/posts", postData);
    return response.data;
  } catch (error: any) {
    return apiUtils.handleError(error);
  }
};

// Example 3: Check authentication status
export const checkAuthStatus = () => {
  const isLoggedIn = tokenManager.isAuthenticated();
  const token = tokenManager.getToken();

  console.log("Is authenticated:", isLoggedIn);
  console.log("Token exists:", !!token);

  return { isLoggedIn, hasToken: !!token };
};

// Example 4: Manual token management
export const loginAndStoreToken = async (email: string, password: string) => {
  try {
    // This would typically be done by your auth service
    const response = await apiClient.post("/auth/login", { email, password });

    if (response.data.access_token) {
      // Store the token
      tokenManager.setToken(response.data.access_token);
      console.log("Token stored successfully");
    }

    return response.data;
  } catch (error: any) {
    return apiUtils.handleError(error);
  }
};

// Example 5: Logout and clear token
export const logoutAndClearToken = async () => {
  try {
    // Call logout endpoint
    await apiClient.post("/auth/logout");

    // Clear token regardless of API response
    tokenManager.removeToken();

    console.log("Logged out successfully");
  } catch (error: any) {
    // Clear token even if API call fails
    tokenManager.removeToken();
    console.log("Logged out (with error):", error.message);
  }
};

// Example 6: Custom headers for specific requests
export const uploadFile = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error: any) {
    return apiUtils.handleError(error);
  }
};

// Example 7: Query parameters
export const searchTrips = async (query: string, page: number = 1) => {
  try {
    const response = await apiClient.get("/trips/search", {
      params: {
        q: query,
        page,
        limit: 10,
      },
    });

    return response.data;
  } catch (error: any) {
    return apiUtils.handleError(error);
  }
};

/*
USAGE EXAMPLES:

1. Basic authenticated request:
   const profile = await fetchUserProfile();

2. Creating data:
   const newPost = await createPost({ title: "My Trip", content: "Amazing adventure!" });

3. Checking auth status:
   const { isLoggedIn, hasToken } = checkAuthStatus();

4. File upload:
   const result = await uploadFile(myFile);

5. Search with params:
   const trips = await searchTrips("paris", 1);

The API client automatically:
- Attaches Bearer token to all requests
- Handles token expiration (401 responses)
- Redirects to login on token expiration
- Provides consistent error handling
- Works with all HTTP methods (GET, POST, PUT, DELETE, etc.)
*/
