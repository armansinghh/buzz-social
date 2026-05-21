import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { FaGithub, FaHeart } from "react-icons/fa";
import { usePageTitle } from "@/hooks/usePageTitle";
import { getAuthErrorMessage } from "@/features/auth/authErrors";

export default function AuthPage() {
  usePageTitle("Welcome");
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
      const friendlyMessage = getAuthErrorMessage(err.code);
      setError(friendlyMessage);
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
    <div className="min-h-screen flex bg-(--bg-secondary)">
      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-18 bg-(--bg-primary) border-r border-(--border-color) relative overflow-hidden">
        {/* Dot grid */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.04] dark:opacity-[0.07]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="dots"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="1"
                cy="1"
                r="1"
                fill="currentColor"
                className="text-(--text-primary)"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
        {/* Ambient glows */}
        <div
          style={{ willChange: "transform" }}
          className="absolute top-[8%] left-[-5%] w-150 h-150 bg-[radial-gradient(circle,rgba(251,191,36,0.15)_0%,transparent_70%)] pointer-events-none animate-[glowA_6s_ease-in-out_infinite]"
        />
        <div
          style={{ willChange: "transform" }}
          className="absolute bottom-[8%] right-[0%] w-125 h-125 bg-[radial-gradient(circle,rgba(139,92,246,0.12)_0%,transparent_70%)] pointer-events-none animate-[glowB_8s_ease-in-out_infinite]"
        />

        {/* Logo */}
        <div className="flex items-center gap-1.5 relative z-10">
          <span className="font-serif text-2xl font-bold text-(--text-primary) tracking-tight">
            buzz
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
        </div>

        {/* Center text */}
        <div className="flex flex-col gap-6 relative z-10">
          <h1 className="font-serif text-6xl font-bold text-(--text-primary) leading-[1.1] tracking-tight">
            What's buzzing <br />
            <span className="text-amber-400"> right now.</span>
          </h1>
          <p className="text-base text-(--text-muted) leading-relaxed">
            Share moments, follow friends, and discover what's trending — all in
            one place.
          </p>

          {/* Social proof */}
          <div className="flex items-center gap-3 pt-2">
            <div className="flex">
              {(["#fbbf24", "#a78bfa", "#34d399", "#f87171"] as const).map(
                (c, i) => (
                  <div
                    key={c}
                    className="w-7 h-7 rounded-full border-2 border-(--bg-primary) shrink-0"
                    style={{ background: c, marginLeft: i === 0 ? 0 : "-8px" }}
                  />
                ),
              )}
            </div>
            <p className="text-sm text-(--text-muted)">
              Join thousands sharing moments
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between relative z-10">
          <p className="flex items-center justify-center gap-1 whitespace-nowrap text-xs text-(--text-muted)">
            © 2026 Buzz · Made with <FaHeart /> by Arman Singh
          </p>
          <a
            href="https://github.com/armansinghh/buzz-social"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-(--text-muted) hover:text-(--text-primary) transition-colors"
          >
            <FaGithub className="w-3.5 h-3.5" />
            GitHub
          </a>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex flex-1 lg:flex-none lg:w-140 items-center justify-center p-6 lg:p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-1.5 mb-6">
            <span className="font-serif text-2xl font-bold text-(--text-primary) tracking-tight">
              buzz
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mb-2 inline-block" />
          </div>

          {/* Card wrapper — bordered on mobile, invisible on desktop */}
          <div className="bg-(--bg-primary) border border-(--border-color) rounded-2xl p-6 shadow-(--shadow-sm) lg:bg-transparent lg:border-none lg:rounded-none lg:p-0 lg:shadow-none">
            {/* Heading */}
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-(--text-primary) tracking-tight mb-1">
                {mode === "login" ? "Sign in" : "Create account"}
              </h2>
              <p className="text-sm text-(--text-muted)">
                {mode === "login"
                  ? "Welcome back. Enter your details below."
                  : "Get started — it only takes a moment."}
              </p>
            </div>

            {/* Form */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-medium text-(--text-secondary)"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className="w-full bg-(--bg-primary) border border-(--border-color) text-(--text-primary) placeholder:text-(--text-muted) text-sm px-3.5 py-2.5 rounded-lg outline-none transition-colors focus:border-(--accent) focus:ring-2 focus:ring-(--accent)/10"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="password"
                  className="text-xs font-medium text-(--text-secondary)"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className="w-full bg-(--bg-primary) border border-(--border-color) text-(--text-primary) placeholder:text-(--text-muted) text-sm px-3.5 py-2.5 rounded-lg outline-none transition-colors focus:border-(--accent) focus:ring-2 focus:ring-(--accent)/10"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                  <span className="text-red-500 text-xs shrink-0">⚠</span>
                  <p className="text-red-500 text-xs">{error}</p>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-(--accent) text-(--bg-primary) text-sm font-semibold py-2.5 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed mt-1"
              >
                {loading
                  ? "Please wait…"
                  : mode === "login"
                    ? "Sign in"
                    : "Sign up"}
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-(--border-color)" />
                <span className="text-xs text-(--text-muted)">or</span>
                <div className="flex-1 h-px bg-(--border-color)" />
              </div>

              <button
                onClick={handleGoogle}
                className="w-full flex items-center justify-center gap-2.5 bg-(--bg-primary) border border-(--border-color) text-(--text-primary) text-sm font-medium py-2.5 rounded-lg transition-colors hover:bg-(--bg-secondary) cursor-pointer"
              >
                <svg
                  className="w-4 h-4 shrink-0"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </button>
            </div>
          </div>
          {/* /card wrapper */}

          {/* Switch mode */}
          <p className="text-xs text-(--text-muted) text-center mt-6">
            {mode === "login"
              ? "Don't have an account?"
              : "Already have an account?"}{" "}
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-(--text-primary) font-medium hover:underline cursor-pointer"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
