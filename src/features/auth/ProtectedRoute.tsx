"use client"

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { useAuth } from "./AuthContext";
import SplashScreen from "@/components/ui/SplashScreen";

const MIN_SPLASH_MS = 2000;

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading, profileError, retryProfile } = useAuth();
  const [minTimerDone, setMinTimerDone] = useState(false);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinTimerDone(true), MIN_SPLASH_MS);
    return () => clearTimeout(t);
  }, []);

  // Wait until auth + profile fully loaded
  if (loading || !minTimerDone) {
    return <SplashScreen />;
  }

  // Not logged in
  if (!user) {
    return redirect("/auth");
  }

  // Profile fetch failed due to network/offline error
  // Do NOT redirect to onboarding — show a retry screen instead
  if (profileError) {
    const handleRetry = async () => {
      setRetrying(true);
      await retryProfile();
      setRetrying(false);
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-(--bg-primary) px-6">
        <div className="max-w-sm w-full text-center space-y-5">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-(--bg-tertiary) text-(--text-muted) mx-auto">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 6s4-2 11-2 11 2 11 2" />
              <path d="M1 12s4-2 11-2 11 2 11 2" />
              <line x1="1" y1="18" x2="5" y2="18" />
              <line x1="19" y1="18" x2="23" y2="18" />
              <line x1="12" y1="18" x2="12" y2="18" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          </div>

          {/* Text */}
          <div className="space-y-1.5">
            <h2 className="text-base font-semibold text-(--text-primary)">
              Connection problem
            </h2>
            <p className="text-sm text-(--text-muted) leading-relaxed">
              Couldn't reach the server. Check your internet connection and try
              again.
            </p>
          </div>

          {/* Retry button */}
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="w-full py-2.5 rounded-xl bg-(--accent) text-(--bg-primary) text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {retrying ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Retrying…
              </span>
            ) : (
              "Try again"
            )}
          </button>
        </div>
      </div>
    );
  }

  // Logged in but no username — genuinely new user
  if (!profile?.username) {
    return redirect("/onboarding");
  }

  // Good to go
  return <>{children}</>;
}
