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

        .auth-left-panel {
          display: none;
        }
        @media (min-width: 768px) {
          .auth-left-panel {
            display: flex;
          }
        }
        .auth-right-panel {
          width: 100%;
        }
        @media (min-width: 768px) {
          .auth-right-panel {
            width: auto;
            min-width: 420px;
          }
        }
        @media (min-width: 1024px) {
          .auth-right-panel {
            min-width: 460px;
          }
        }
        .auth-mobile-logo {
          display: block;
        }
        @media (min-width: 768px) {
          .auth-mobile-logo {
            display: none;
          }
        }
        .auth-divider {
          display: none;
        }
        @media (min-width: 768px) {
          .auth-divider {
            display: block;
          }
        }
      `}</style>

      <div style={{ minHeight: "100vh", display: "flex", background: "#0c0c0e" }}>

        {/* ── LEFT PANEL ── */}
        <div
          className="auth-left-panel"
          style={{
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            padding: "48px 56px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Grid texture */}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.03, pointerEvents: "none" }} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="auth-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#auth-grid)" />
          </svg>

          {/* Ambient glows */}
          <div style={{ position: "absolute", top: "15%", left: "20%", width: "350px", height: "350px", borderRadius: "50%", background: "radial-gradient(circle, rgba(251,191,36,0.13) 0%, transparent 65%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "20%", right: "10%", width: "280px", height: "280px", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 65%)", pointerEvents: "none" }} />

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", position: "relative", zIndex: 1 }}>
            <span style={{ fontFamily: "Georgia, serif", fontSize: "26px", fontWeight: 700, color: "#fafafa", letterSpacing: "-1px" }}>buzz</span>
            <span className="auth-pulse-dot" style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#fbbf24", display: "inline-block", marginBottom: "8px" }} />
          </div>

          {/* Center illustration + text */}
          <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "40px" }}>

            {/* Floating cards cluster */}
            <div style={{ position: "relative", width: "340px", height: "260px" }}>

              {/* Card C — back left */}
              <div
                className="auth-float-c"
                style={{
                  position: "absolute", top: "40px", left: "0px",
                  width: "220px", borderRadius: "16px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  padding: "16px",
                  backdropFilter: "blur(8px)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "linear-gradient(135deg, #a78bfa, #7c3aed)", flexShrink: 0 }} />
                  <div>
                    <div style={{ width: "70px", height: "7px", borderRadius: "4px", background: "rgba(255,255,255,0.18)", marginBottom: "4px" }} />
                    <div style={{ width: "45px", height: "5px", borderRadius: "4px", background: "rgba(255,255,255,0.07)" }} />
                  </div>
                </div>
                <div style={{ width: "100%", height: "60px", borderRadius: "10px", background: "rgba(139,92,246,0.15)", marginBottom: "10px" }} />
                <div style={{ display: "flex", gap: "12px" }}>
                  <span style={{ fontSize: "13px" }}>❤️</span>
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", fontFamily: "system-ui", alignSelf: "center" }}>89 likes</span>
                </div>
              </div>

              {/* Card B — back right */}
              <div
                className="auth-float-b"
                style={{
                  position: "absolute", top: "20px", right: "0px",
                  width: "200px", borderRadius: "16px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  padding: "16px",
                  backdropFilter: "blur(8px)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #34d399, #059669)", flexShrink: 0 }} />
                  <div>
                    <div style={{ width: "60px", height: "7px", borderRadius: "4px", background: "rgba(255,255,255,0.18)", marginBottom: "4px" }} />
                    <div style={{ width: "38px", height: "5px", borderRadius: "4px", background: "rgba(255,255,255,0.07)" }} />
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginBottom: "10px" }}>
                  <div style={{ width: "100%", height: "6px", borderRadius: "4px", background: "rgba(255,255,255,0.12)" }} />
                  <div style={{ width: "75%", height: "6px", borderRadius: "4px", background: "rgba(255,255,255,0.07)" }} />
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <span style={{ fontSize: "13px" }}>💬</span>
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", fontFamily: "system-ui", alignSelf: "center" }}>24 comments</span>
                </div>
              </div>

              {/* Card A — front hero */}
              <div
                className="auth-float-a"
                style={{
                  position: "absolute", bottom: "0px", left: "50%",
                  width: "240px", borderRadius: "18px",
                  background: "linear-gradient(160deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.04) 100%)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  padding: "18px",
                  backdropFilter: "blur(16px)",
                  boxShadow: "0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                  <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "linear-gradient(135deg, #fbbf24, #f97316)", flexShrink: 0 }} />
                  <div>
                    <div style={{ width: "80px", height: "8px", borderRadius: "4px", background: "rgba(255,255,255,0.3)", marginBottom: "5px" }} />
                    <div style={{ width: "50px", height: "6px", borderRadius: "4px", background: "rgba(255,255,255,0.12)" }} />
                  </div>
                </div>
                <div style={{ width: "100%", height: "80px", borderRadius: "12px", background: "linear-gradient(135deg, rgba(251,191,36,0.2), rgba(249,115,22,0.15))", marginBottom: "12px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", bottom: "8px", right: "8px", background: "rgba(0,0,0,0.4)", borderRadius: "6px", padding: "2px 7px", fontSize: "10px", color: "rgba(255,255,255,0.7)", fontFamily: "system-ui" }}>photo</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginBottom: "12px" }}>
                  <div style={{ width: "100%", height: "6px", borderRadius: "4px", background: "rgba(255,255,255,0.18)" }} />
                  <div style={{ width: "65%", height: "6px", borderRadius: "4px", background: "rgba(255,255,255,0.09)" }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <span style={{ fontSize: "14px" }}>❤️</span>
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontFamily: "system-ui" }}>142 likes</span>
                  <span style={{ fontSize: "14px" }}>💬</span>
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontFamily: "system-ui" }}>31</span>
                </div>
              </div>
            </div>

            {/* Text */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h1
                style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: "clamp(36px, 3.5vw, 52px)",
                  fontWeight: 700,
                  color: "#fafafa",
                  lineHeight: 1.1,
                  letterSpacing: "-1px",
                  margin: 0,
                }}
              >
                What's buzzing<br />
                <span style={{ color: "#fbbf24" }}>right now.</span>
              </h1>
              <p style={{ fontSize: "15px", color: "rgba(250,250,250,0.38)", lineHeight: 1.7, margin: 0, maxWidth: "320px" }}>
                Share moments, follow friends, and discover what's trending — all in one place.
              </p>

              {/* Social proof pill */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: "2px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "100px", padding: "8px 16px", width: "fit-content" }}>
                {(["#fbbf24", "#a78bfa", "#34d399", "#f87171"] as const).map((c, i) => (
                  <div key={c} style={{ width: "22px", height: "22px", borderRadius: "50%", background: c, border: "2px solid #0c0c0e", marginLeft: i === 0 ? 0 : "-8px", flexShrink: 0 }} />
                ))}
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", fontFamily: "system-ui", marginLeft: "10px" }}>
                  Join thousands sharing moments
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.15)", position: "relative", zIndex: 1 }}>
            © 2026 Buzz · Made with ❤️ by Arman Singh
          </p>
        </div>

        {/* Divider */}
        <div className="auth-divider" style={{ width: "1px", background: "rgba(255,255,255,0.06)", flexShrink: 0 }} />

        {/* ── RIGHT PANEL — original form, untouched ── */}
        <div
          className="auth-right-panel"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px 40px",
            background: "#111113",
          }}
        >
          <div style={{ width: "100%", maxWidth: "340px" }}>

            {/* Mobile-only logo */}
            <div className="auth-mobile-logo" style={{ textAlign: "center", marginBottom: "32px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "8px" }}>
                <span style={{ fontSize: "28px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-1px", fontFamily: "Georgia, serif" }}>buzz</span>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#fbbf24", display: "inline-block", marginBottom: "8px" }} />
              </div>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: 0 }}>What's buzzing right now.</p>
            </div>

            {/* Card — original markup */}
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