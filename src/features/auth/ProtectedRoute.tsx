import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { AUTH_KEY } from "./AuthContext";
import AppSkeleton from "@/components/ui/AppSkeleton";

//  Read flag synchronously before Firebase initializes
const wasLoggedIn = localStorage.getItem(AUTH_KEY) === "true";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading } = useAuth();

  //  Only show skeleton on true first-ever visits
  if (loading && !wasLoggedIn) {
    return <AppSkeleton />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!profile?.username) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}