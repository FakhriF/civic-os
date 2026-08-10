import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { apiClient, setAccessToken } from "../../services/api-client";

// Typed wrapper for the user data returned by the backend
export interface User {
  id: number;
  email: string;
  fullName: string;
  roleId: number;
  departmentId: number;
}

// Auth functions exposed to every component through the context
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider that wraps the whole application (mounted in main.tsx)
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 1. Restore the session on first load / page refresh
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Call the refresh endpoint to check whether the user has an
        // active session stored in the HttpOnly cookie
        const res = await apiClient.post("/api/v1/auth/refresh");
        const { accessToken, user: userData } = res.data.data;

        setAccessToken(accessToken);
        setUser(userData);
      } catch {
        // No active session: reset the user state
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for the event apiClient fires when the refresh token is expired/invalid
    const handleUnauthorized = () => {
      setUser(null);
      setAccessToken(null);
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, []);

  // 2. Login: call the API, store the token, and set the user
  const login = async (email: string, password: string) => {
    const res = await apiClient.post("/api/v1/auth/login", { email, password });
    const { accessToken, user: userData } = res.data.data;
    setAccessToken(accessToken);
    setUser(userData);
  };

  // 3. Logout: clear the backend cookie, then wipe in-memory state
  const logout = async () => {
    try {
      await apiClient.post("/api/v1/auth/logout");
    } finally {
      setUser(null);
      setAccessToken(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Convenience hook so components can call: const { user, login } = useAuth()
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
