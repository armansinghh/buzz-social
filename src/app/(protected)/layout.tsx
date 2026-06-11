"use client";

import { AuthProvider } from "@/features/auth/AuthContext";
import { UIProvider } from "@/contexts/UIContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { NotificationProvider } from "@/features/notifications/NotificationContext";
import { PostProvider } from "@/features/posts/PostContext";
import { FollowProvider } from "@/features/follow/FollowContext";
import AppLayout from "@/components/layout/AppLayout";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <UIProvider>
        <ToastProvider>
          <NotificationProvider>
            <PostProvider>
              <FollowProvider>
                <AppLayout>{children}</AppLayout>
              </FollowProvider>
            </PostProvider>
          </NotificationProvider>
        </ToastProvider>
      </UIProvider>
    </AuthProvider>
  );
}