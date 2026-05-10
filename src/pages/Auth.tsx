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
    <>
      <style>{`
        @keyframes float-a {
          0%, 100% { transform: translateX(-50%) rotate(-2deg) translateY(0px); }
          50%       { transform: translateX(-50%) rotate(-2deg) translateY(-14px); }
        }
        @keyframes float-b {
          0%, 100% { transform: translateY(0px) rotate(3deg); }
          50%       { transform: translateY(-10px) rotate(3deg); }
        }
        @keyframes float-c {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50%       { transform: translateY(-18px) rotate(-1deg); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.6; transform: scale(1.3); }
        }
        .auth-float-a { animation: float-a 6s ease-in-out infinite; }
        .auth-float-b { animation: float-b 8s ease-in-out infinite 1s; }
        .auth-float-c { animation: float-c 7s ease-in-out infinite 2s; }
        .auth-pulse-dot { animation: pulse-dot 2.5s ease-in-out infinite; }
      `}</style>

      <div className="min-h-screen flex bg-[#0c0c0e]">

        {/* ── LEFT PANEL ── */}
        <div className="hidden md:flex flex-1 flex-col justify-center px-14 py-12 relative overflow-hidden">

          {/* Grid texture */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="auth-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#auth-grid)" />
          </svg>

          {/* Ambient glows */}
          <div className="absolute top-[15%] left-[20%] w-[350px] h-[350px] rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.13)_0%,transparent_65%)] pointer-events-none" />
          <div className="absolute bottom-[20%] right-[10%] w-[280px] h-[280px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.10)_0%,transparent_65%)] pointer-events-none" />

          {/* Logo */}
          <div className="flex items-center gap-2 relative z-10">
            <span className="font-serif text-[26px] font-bold text-[#fafafa] tracking-tight">buzz</span>
            <span className="auth-pulse-dot w-2 h-2 rounded-full bg-amber-400 inline-block mb-2" />
          </div>

          {/* Center illustration + text */}
          <div className="relative z-10 flex flex-col items-center gap-10">

            {/* Floating cards cluster */}
            <div className="relative w-[340px] h-[260px]">

              {/* Card C — back left */}
              <div className="auth-float-c absolute top-10 left-0 w-[220px] rounded-2xl bg-white/[0.03] border border-white/[0.07] p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-[30px] h-[30px] rounded-full bg-gradient-to-br from-violet-400 to-violet-700 shrink-0" />
                  <div>
                    <div className="w-[70px] h-[7px] rounded bg-white/[0.18] mb-1" />
                    <div className="w-[45px] h-[5px] rounded bg-white/[0.07]" />
                  </div>
                </div>
                <div className="w-full h-[60px] rounded-xl bg-violet-500/15 mb-2.5" />
                <div className="flex gap-3">
                  <span className="text-[13px]">❤️</span>
                  <span className="text-[13px]">💬</span>
                </div>
              </div>

              {/* Card B — back right */}
              <div className="auth-float-b absolute top-0 right-0 w-[180px] rounded-2xl bg-white/[0.04] border border-white/[0.08] p-3.5 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 shrink-0" />
                  <div>
                    <div className="w-16 h-[6px] rounded bg-white/20 mb-1" />
                    <div className="w-10 h-[5px] rounded bg-white/[0.08]" />
                  </div>
                </div>
                <div className="w-full h-14 rounded-xl bg-emerald-500/10 mb-2" />
                <div className="flex gap-2">
                  <span className="text-xs">❤️</span>
                  <span className="text-xs text-white/40 font-[system-ui]">89</span>
                </div>
              </div>

              {/* Card A — front/center */}
              <div className="auth-float-a absolute bottom-0 left-1/2 w-[230px] rounded-2xl bg-white/[0.06] border border-white/[0.12] p-4 backdrop-blur-md">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 shrink-0" />
                  <div>
                    <div className="w-20 h-2 rounded bg-white/30 mb-1" />
                    <div className="w-[50px] h-1.5 rounded bg-white/[0.12]" />
                  </div>
                </div>
                <div className="relative w-full h-20 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/15 mb-3 overflow-hidden">
                  <div className="absolute bottom-2 right-2 bg-black/40 rounded-md px-1.5 py-0.5 text-[10px] text-white/70 font-[system-ui]">photo</div>
                </div>
                <div className="flex flex-col gap-1 mb-3">
                  <div className="w-full h-1.5 rounded bg-white/[0.18]" />
                  <div className="w-[65%] h-1.5 rounded bg-white/[0.09]" />
                </div>
                <div className="flex items-center gap-3.5">
                  <span className="text-sm">❤️</span>
                  <span className="text-[11px] text-white/40 font-[system-ui]">142 likes</span>
                  <span className="text-sm">💬</span>
                  <span className="text-[11px] text-white/40 font-[system-ui]">31</span>
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="flex flex-col gap-4">
              <h1 className="font-serif text-[clamp(36px,3.5vw,52px)] font-bold text-[#fafafa] leading-[1.1] tracking-tight m-0">
                What's buzzing<br />
                <span className="text-amber-400">right now.</span>
              </h1>
              <p className="text-[15px] text-white/[0.38] leading-[1.7] m-0 max-w-[320px]">
                Share moments, follow friends, and discover what's trending — all in one place.
              </p>

              {/* Social proof pill */}
              <div className="inline-flex items-center gap-0.5 bg-white/[0.05] border border-white/[0.09] rounded-full px-4 py-2 w-fit">
                {(["#fbbf24", "#a78bfa", "#34d399", "#f87171"] as const).map((c, i) => (
                  <div
                    key={c}
                    className="w-[22px] h-[22px] rounded-full border-2 border-[#0c0c0e] shrink-0"
                    style={{ background: c, marginLeft: i === 0 ? 0 : "-8px" }}
                  />
                ))}
                <span className="text-xs text-white/45 font-[system-ui] ml-2.5">
                  Join thousands sharing moments
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-xs text-white/[0.15] relative z-10">
            © 2026 Buzz · Made with ❤️ by Arman Singh
          </p>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px bg-white/[0.06] shrink-0" />

        {/* ── RIGHT PANEL ── */}
        <div className="w-full md:w-auto md:min-w-[420px] lg:min-w-[460px] flex items-center justify-center px-10 py-12 bg-[#111113]">
          <div className="w-full max-w-[340px]">

            {/* Mobile-only logo */}
            <div className="block md:hidden text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="font-serif text-[28px] font-bold text-(--text-primary) tracking-tight">buzz</span>
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block mb-2" />
              </div>
              <p className="text-sm text-(--text-muted) m-0">What's buzzing right now.</p>
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
                  <label className="text-xs font-medium text-(--text-secondary) block mb-1.5">Email</label>
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
                  <label className="text-xs font-medium text-(--text-secondary) block mb-1.5">Password</label>
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
                  {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Sign up"}
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
                    <button onClick={() => setMode("signup")} className="text-(--text-primary) font-medium hover:underline">
                      Sign up
                    </button>
                  </p>
                ) : (
                  <p className="text-xs text-(--text-muted)">
                    Already have an account?{" "}
                    <button onClick={() => setMode("login")} className="text-(--text-primary) font-medium hover:underline">
                      Sign in
                    </button>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}