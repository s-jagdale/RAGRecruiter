import { createContext, useCallback, useEffect, useState } from "react";
import { loginUser, registerUser, fetchCurrentUser } from "../api/auth";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from "../constants";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(AUTH_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  // Revalidate the stored token against /auth/me on load, so a stale/expired
  // token doesn't leave the UI thinking the user is logged in.
  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }
    fetchCurrentUser()
      .then((freshUser) => {
        setUser(freshUser);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(freshUser));
      })
      .catch(() => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const persistSession = (data) => {
    localStorage.setItem(AUTH_TOKEN_KEY, data.access_token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
    setUser(data.user);
  };

  const login = useCallback(async (credentials) => {
    const data = await loginUser(credentials);
    persistSession(data);
    return data.user;
  }, []);

  const register = useCallback(async (details) => {
    const data = await registerUser(details);
    persistSession(data);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}
