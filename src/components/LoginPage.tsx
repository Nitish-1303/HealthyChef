import { FormEvent, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function LoginPage() {
  const { loading, authenticated, authConfigured, demoEnabled, login, startDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const target = (location.state as { from?: string } | null)?.from || "/dashboard";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!loading && authenticated) return <Navigate to={target} replace />;

  const run = async (action: () => Promise<string | null>) => {
    setBusy(true);
    setError("");
    const message = await action();
    setBusy(false);
    if (message) setError(message);
    else navigate(target, { replace: true });
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    run(() => login(username, password));
  };

  const inputClass =
    "w-full rounded-2xl bg-health-bg/40 px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-health-sage/30";

  return (
    <div className="mx-auto mt-10 max-w-md">
      <div className="health-card p-8">
        <h1 className="text-3xl tracking-tight">Sign in</h1>
        <p className="mt-2 text-sm text-health-muted">This workspace is private. Sign in to see invoices and your pantry.</p>

        {!authConfigured ? (
          <p className="mt-6 rounded-2xl bg-citrus/40 p-4 text-sm">
            Login is not set up on this server yet. The owner needs to add an <code>ADMIN_PASSWORD</code> setting.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-5">
            <div className="space-y-2">
              <label htmlFor="username" className="health-label text-health-olive">Username</label>
              <input
                id="username"
                className={inputClass}
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="health-label text-health-olive">Password</label>
              <input
                id="password"
                type="password"
                className={inputClass}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p role="alert" className="text-sm font-semibold text-red-700">
                {error}
              </p>
            )}
            <button type="submit" disabled={busy} className="btn-health w-full bg-health-sage py-4 disabled:opacity-60">
              {busy ? "Signing in..." : "Sign in"}
            </button>
          </form>
        )}

        {authConfigured && demoEnabled && (
          <div className="mt-6 border-t border-health-ink/10 pt-6 text-center">
            <p className="mb-3 text-sm text-health-muted">Just looking? Browse a read-only demo with sample data.</p>
            <button type="button" disabled={busy} onClick={() => run(startDemo)} className="btn-health bg-white text-health-ink">
              View demo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
