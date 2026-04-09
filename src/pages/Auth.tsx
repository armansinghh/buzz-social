import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";

export default function AuthPage() {
  const { login, signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
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
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

const handleGoogle = async () => {
  try {
    await loginWithGoogle();
    navigate("/");
  } catch (err: any) {
    setError("Google sign-in failed");
  }
};

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
          <p className="text-sm text-(--text-muted)">
            What's buzzing right now.
          </p>
        </div>

        {/* Card */}
        <div
          className="bg-(--bg-primary) rounded-2xl p-6 border border-(--border-color)"
          style={{ boxShadow: "var(--shadow-md)" }}
        >
          <h1 className="text-lg font-semibold text-(--text-primary) mb-5">
            {mode === "login" ? "Sign in" : "Create account"}
          </h1>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-(--text-secondary) block mb-1.5">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full border border-(--border-color) bg-(--bg-secondary) text-(--text-primary) placeholder:text-(--text-muted) p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-(--accent)/20 focus:border-(--accent)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-(--text-secondary) block mb-1.5">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••"
                className="w-full border border-(--border-color) bg-(--bg-secondary) text-(--text-primary) placeholder:text-(--text-muted) p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-(--accent)/20 focus:border-(--accent)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20">
                <span className="text-red-500 text-xs">⚠</span>
                <p className="text-red-500 text-xs">{error}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-(--accent) text-(--bg-primary) p-3 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-60"
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Sign in"
                : "Sign up"}
            </button>

            <div className="flex items-center gap-2 my-2">
              <div className="flex-1 h-px bg-(--border-color)" />
              <span className="text-xs text-(--text-muted)">or</span>
              <div className="flex-1 h-px bg-(--border-color)" />
            </div>

            <button
              onClick={handleGoogle}
              className="w-full border border-(--border-color) p-3 rounded-xl text-sm font-medium hover:bg-(--bg-secondary)"
            >
              Continue with Google
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-(--border-color) text-center">
            {mode === "login" ? (
              <p className="text-xs text-(--text-muted)">
                Don't have an account?{" "}
                <button
                  onClick={() => setMode("signup")}
                  className="text-(--text-primary) font-medium hover:underline"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p className="text-xs text-(--text-muted)">
                Already have an account?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="text-(--text-primary) font-medium hover:underline"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}