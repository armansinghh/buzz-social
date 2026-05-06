import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { AUTH_KEY } from "./AuthContext";
import AppSkeleton from "@/components/ui/AppSkeleton";

const wasLoggedIn = localStorage.getItem(AUTH_KEY) === "true";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading } = useAuth();

  // First-ever visit with no cached flag
  if (loading && !wasLoggedIn) {
    return <AppSkeleton />;
  }

  //  Still initializing but we trust the cached flag — don't redirect yet
  if (loading) {
    return <>{children}</>;
  }

  // Firebase resolved — now we can trust these checks
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!profile?.username) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}