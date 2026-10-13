import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";

interface AuthState {
  loading: boolean;
  authenticated: boolean;
  role?: "admin" | "demo";
  demoEnabled: boolean;
  authConfigured: boolean;
}

interface AuthContextValue extends AuthState {
  login: (username: string, password: string) => Promise<string | null>;
  startDemo: () => Promise<string | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

async function post(url: string, body?: unknown): Promise<{ ok: boolean; data: any }> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  return { ok: res.ok, data: await res.json().catch(() => ({})) };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    loading: true,
    authenticated: false,
    demoEnabled: false,
    authConfigured: true,
  });

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setState({
        loading: false,
        authenticated: Boolean(data.authenticated),
        role: data.role,
        demoEnabled: Boolean(data.demoEnabled),
        authConfigured: data.authConfigured !== false,
      });
    } catch {
      setState((s) => ({ ...s, loading: false, authenticated: false }));
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // If the session ends while the app is open, any API call returns 401.
  // Catch that in one place and send the user back to the login page.
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const res = await originalFetch(...args);
      const url = typeof args[0] === "string" ? args[0] : args[0] instanceof Request ? args[0].url : String(args[0]);
      if (res.status === 401 && url.startsWith("/api") && !url.startsWith("/api/auth")) {
        setState((s) => ({ ...s, authenticated: false, role: undefined }));
      }
      return res;
    };
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const login = async (username: string, password: string) => {
    const { ok, data } = await post("/api/auth/login", { username, password });
    if (!ok) return (data.error as string) || "Could not sign in";
    await refresh();
    return null;
  };

  const startDemo = async () => {
    const { ok, data } = await post("/api/auth/demo");
    if (!ok) return (data.error as string) || "Could not start the demo";
    await refresh();
    return null;
  };

  const logout = async () => {
    await post("/api/auth/logout");
    setState((s) => ({ ...s, authenticated: false, role: undefined }));
  };

  return <AuthContext.Provider value={{ ...state, login, startDemo, logout }}>{children}</AuthContext.Provider>;
}
