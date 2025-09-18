// Types based on backend schemas
interface UserResponse {
  id: number;
  provider_id: string | null;
  username: string | null;
  email: string;
  avatar_url: string | null;
  name: string | null;
  provider: string | null;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  user: UserResponse;
}

interface APIResponse<T = any> {
  status: "success" | "fail";
  message: string;
  data: T | null;
}

interface UserCreate {
  email: string;
  password: string;
}

interface UserLogin {
  email: string;
  password: string;
}

interface AuthContextType {
  user: UserResponse | null;
  loading: boolean;
  error: string | null;
  loginWithGitHub: () => void;
  loginWithGoogle: () => void;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}
