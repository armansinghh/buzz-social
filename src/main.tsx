import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/app/App";
import { AuthProvider } from "@/features/auth/AuthContext";
import { UIProvider } from "@/features/ui/UIContext";
import { NotificationProvider } from "@/features/notifications/NotificationContext";
import { PostProvider } from "@/features/posts/PostContext";
import { ToastProvider } from "@/features/ui/ToastContext";
import { FollowProvider } from "@/features/follow/FollowContext";
import "@/styles/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <UIProvider>
        <ToastProvider>
          <NotificationProvider>
            <PostProvider>
              <FollowProvider>
                <App />
              </FollowProvider>
            </PostProvider>
          </NotificationProvider>
        </ToastProvider>
      </UIProvider>
    </AuthProvider>
  </React.StrictMode>,
);
