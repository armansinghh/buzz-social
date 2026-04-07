import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";

export default function AuthPage() {
  const { login, signup, loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect once user is available — loading not needed as a dependency
  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Google uses redirect — no navigate() call after
  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error("Google sign-in error:", err);
      setError("Google sign-in failed. Please try again.");
    }
  };

  const toggleMode = () => {
    setMode((prev) => (prev === "login" ? "signup" : "login"));
    setError(""); // clear stale errors on mode switch
  };

  const isLogin = mode === "login";

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--bg-secondary) px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-3xl font-bold tracking-tight text-(--text-primary)">
              buzz
            </span>
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          </div>
          <p className="text-sm text-(--text-muted)">What's buzzing right now.</p>
        </div>

        {/* Card */}
        <div className="bg-(--bg-primary) rounded-2xl p-6 border border-(--border-color)">
          <h1 className="text-lg font-semibold text-(--text-primary) mb-5">
            {isLogin ? "Sign in" : "Create account"}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-(--text-secondary) block mb-1.5">
                Email
              </label>
              <input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full border border-(--border-color) bg-(--bg-secondary) text-(--text-primary) p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-(--accent)/20"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-(--text-secondary) block mb-1.5">
                Password
              </label>
              <input
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                placeholder="••••••"
                className="w-full border border-(--border-color) bg-(--bg-secondary) text-(--text-primary) p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-(--accent)/20"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p className="text-red-500 text-xs">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-(--accent) text-(--bg-primary) p-3 rounded-xl text-sm font-semibold disabled:opacity-60"
            >
              {loading ? "Please wait…" : isLogin ? "Sign in" : "Sign up"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-2 my-4">
            <div className="flex-1 h-px bg-(--border-color)" />
            <span className="text-xs text-(--text-muted)">or</span>
            <div className="flex-1 h-px bg-(--border-color)" />
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            className="w-full border border-(--border-color) p-3 rounded-xl text-sm font-medium hover:bg-(--bg-secondary)"
          >
            Continue with Google
          </button>

          {/* Toggle mode */}
          <div className="mt-4 pt-4 border-t border-(--border-color) text-center">
            <p className="text-xs text-(--text-muted)">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={toggleMode}
                className="text-(--text-primary) font-medium hover:underline"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}