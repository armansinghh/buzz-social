import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import AppSkeleton from "@/components/ui/AppSkeleton";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading } = useAuth();

  // Wait until auth + profile fully loaded
  if (loading) {
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