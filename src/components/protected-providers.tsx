"use client";

import { ToastProvider } from "@/contexts/ToastContext";
import { NotificationProvider } from "@/features/notifications/NotificationContext";
import { PostProvider } from "@/features/posts/PostContext";
import { FollowProvider } from "@/features/follow/FollowContext";

export default function ProtectedProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <NotificationProvider>
        <PostProvider>
          <FollowProvider>
            {children}
          </FollowProvider>
        </PostProvider>
      </NotificationProvider>
    </ToastProvider>
  );
}