import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import AppSkeleton from "@/components/ui/AppSkeleton";

const MIN_SPLASH_MS = 1500;

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading } = useAuth();
  const [minTimerDone, setMinTimerDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinTimerDone(true), MIN_SPLASH_MS);
    return () => clearTimeout(t);
  }, []);
  // Wait until auth + profile fully loaded
  if (loading || !minTimerDone) {
    return <AppSkeleton />;
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Logged in but no username/profile incomplete
  if (!profile?.username) {
    return <Navigate to="/onboarding" replace />;
  }

  // Good to go
  return <>{children}</>;
}