import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { accountsApi } from "../features/accounts/api";
import { tokenStore } from "../lib/apiClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // "loading" | "authenticated" | "anonymous"
  const [status, setStatus] = useState("loading");

  const loadUser = useCallback(async () => {
    if (!tokenStore.getAccess()) {
      setStatus("anonymous");
      return;
    }
    try {
      const data = await accountsApi.getUser();
      setUser(data);
      setStatus("authenticated");
    } catch {
      tokenStore.clear();
      setUser(null);
      setStatus("anonymous");
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const applySession = (data) => {
    tokenStore.set(data.access, data.refresh);
    setUser(data.user);
    setStatus("authenticated");
  };

  const login = async (email, password) => {
    const data = await accountsApi.login(email, password);
    applySession(data);
    return data.user;
  };

  const loginWithGoogle = async (code) => {
    const data = await accountsApi.googleLogin(code);
    applySession(data);
    return data.user;
  };

  // Registration does not log the user in — ACCOUNT_EMAIL_VERIFICATION is
  // "mandatory", so the account can't authenticate until the email link is
  // confirmed. The caller routes to the check-email page on success.
  const register = (payload) => accountsApi.register(payload);

  const logout = async () => {
    const refresh = tokenStore.getRefresh();
    try {
      if (refresh) await accountsApi.logout(refresh);
    } catch {
      // Best-effort — clear local state regardless of server response.
    }
    tokenStore.clear();
    setUser(null);
    setStatus("anonymous");
  };

  const updateProfile = async (payload) => {
    const data = await accountsApi.updateUser(payload);
    setUser(data);
    return data;
  };

  return (
    <AuthContext.Provider
      value={{ user, status, login, loginWithGoogle, register, logout, updateProfile, refresh: loadUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
