import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { login as loginRequest, logout as logoutRequest, getCurrentUser } from "../services/authService";

const AuthContext = createContext(null);
const TOKEN_KEY = "sr360_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const bootstrapSession = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const me = await getCurrentUser();
      setUser(me);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrapSession();
  }, [bootstrapSession]);

  // Listen for a global "session expired" event fired by the API client's 401 interceptor.
  useEffect(() => {
    const handleExpired = () => {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    };
    window.addEventListener("sr360:session-expired", handleExpired);
    return () => window.removeEventListener("sr360:session-expired", handleExpired);
  }, []);

  const login = async (username, password) => {
    const data = await loginRequest(username, password);
    localStorage.setItem(TOKEN_KEY, data.access_token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    await logoutRequest();
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}