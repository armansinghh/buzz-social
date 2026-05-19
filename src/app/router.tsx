import { createBrowserRouter } from "react-router-dom";
import { ErrorElementFallback } from "@/components/ui/ErrorBoundary";
import AppLayout from "@/components/layout/AppLayout";
import Home from "@/pages/Home";
import AuthPage from "@/pages/Auth";
import Profile from "@/features/profile/Profile";
import NotFound from "@/pages/NotFound";
import Explore from "@/features/explore/Explore";
import Search from "@/features/search/Search";
import Onboarding from "@/pages/Onboarding";
import PostDetail from "@/pages/PostDetail";
import ProtectedRoute from "@/features/auth/ProtectedRoute";

export const router = createBrowserRouter([
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorElementFallback />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/explore", element: <Explore /> },
      { path: "/search", element: <Search /> },
      { path: "/profile/:id", element: <Profile /> },
      { path: "/post/:id", element: <PostDetail /> },
    ],
  },
  { path: "/auth", element: <AuthPage /> },
  { path: "/onboarding", element: <Onboarding /> },
  { path: "*", element: <NotFound /> },
]);
