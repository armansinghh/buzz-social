import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError("");
    // Simulate a brief loading state
    await new Promise((r) => setTimeout(r, 300));
    const success = login(email, password);
    setLoading(false);
    if (success) {
      navigate("/");
    } else {
      setError("Invalid credentials. Try: testuser / 123456");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-secondary)] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">buzz</span>
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          </div>
          <p className="text-sm text-[var(--text-muted)]">What's buzzing right now.</p>
        </div>

        {/* Card */}
        <div
          className="bg-[var(--bg-primary)] rounded-2xl p-6 border border-[var(--border-color)]"
          style={{ boxShadow: "var(--shadow-md)" }}
        >
          <h1 className="text-lg font-semibold text-[var(--text-primary)] mb-5">Sign in</h1>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">
                Username
              </label>
              <input
                type="text"
                placeholder="testuser"
                className="w-full border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••"
                className="w-full border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20">
                <span className="text-red-500 text-xs">⚠</span>
                <p className="text-red-500 text-xs">{error}</p>
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-[var(--accent)] text-[var(--bg-primary)] p-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-[var(--border-color)] text-center">
            <p className="text-xs text-[var(--text-muted)]">
              Don't have an account?{" "}
              <Link to="/register" className="text-[var(--text-primary)] font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Demo hint */}
        <p className="text-center text-xs text-[var(--text-muted)] mt-4">
          Demo: <span className="font-mono text-[var(--text-secondary)]">testuser</span> /{" "}
          <span className="font-mono text-[var(--text-secondary)]">123456</span>
        </p>
      </div>
    </div>
  );
}