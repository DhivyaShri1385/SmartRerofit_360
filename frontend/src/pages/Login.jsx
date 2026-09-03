import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Cpu, Loader2, AlertTriangle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const DEMO_ACCOUNTS = [
  { role: "Admin", username: "admin", password: "admin123" },
  { role: "Engineer", username: "engineer", password: "engineer123" },
  { role: "Operator", username: "operator", password: "operator123" },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const redirectTo = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (demoUsername, demoPassword) => {
    setUsername(demoUsername);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-6">
          <Cpu className="text-accent" size={28} />
          <span className="text-lg font-semibold text-gray-100">SmartRetrofit 360</span>
        </div>

        <form onSubmit={handleSubmit} className="panel p-6 space-y-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-surface-elevated border border-surface-border rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-accent"
              placeholder="e.g. admin"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-elevated border border-surface-border rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-accent"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-status-critical text-xs">
              <AlertTriangle size={14} /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-accent hover:bg-accent-muted transition-colors text-white text-sm font-medium py-2 rounded flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            Sign In
          </button>
        </form>

        <div className="mt-4 panel p-4">
          <p className="text-[11px] text-gray-500 mb-2">
            Demo accounts (development only — not production-safe credentials):
          </p>
          <div className="space-y-1.5">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.username}
                type="button"
                onClick={() => fillDemo(acc.username, acc.password)}
                className="w-full flex items-center justify-between text-xs px-2 py-1.5 rounded hover:bg-surface-elevated text-gray-400"
              >
                <span>{acc.role}</span>
                <span className="font-mono text-gray-600">{acc.username} / {acc.password}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}