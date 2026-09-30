import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { clearTokens, storeTokens } from "../api/axios";
import { AuthContext } from "./auth-context";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem("access_token")) {
      setUser(null);
      setLoading(false);
      return null;
    }
    try {
      const { data } = await api.get("auth/me/");
      setUser(data);
      return data;
    } catch {
      clearTokens();
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(refreshUser, 0);
    return () => window.clearTimeout(timer);
  }, [refreshUser]);
  useEffect(() => {
    const handleExpired = () => { setUser(null); navigate("/login", { replace: true }); };
    window.addEventListener("auth:expired", handleExpired);
    return () => window.removeEventListener("auth:expired", handleExpired);
  }, [navigate]);

  const login = useCallback(async (credentials) => {
    const { data } = await api.post("auth/login/", credentials);
    storeTokens(data);
    const { data: currentUser } = await api.get("auth/me/");
    setUser(currentUser);
    return currentUser;
  }, []);

  const register = useCallback((form) => api.post("auth/register/", form), []);
  const logout = useCallback(() => { clearTokens(); setUser(null); navigate("/login"); }, [navigate]);
  const value = useMemo(() => ({ user, loading, login, logout, register, refreshUser }), [user, loading, login, logout, register, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
