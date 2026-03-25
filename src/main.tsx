import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/app/App";
import { AuthProvider } from "@/features/auth/AuthContext";
import { UIProvider } from "@/features/ui/UIContext";
import { NotificationProvider } from "@/features/notifications/NotificationContext";
import { PostProvider } from "@/features/posts/PostContext";
import { ToastProvider } from "@/features/ui/ToastContext";
import "@/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <UIProvider>
        <ToastProvider>
          <NotificationProvider>
            <PostProvider>
              <App />
            </PostProvider>
          </NotificationProvider>
        </ToastProvider>
      </UIProvider>
    </AuthProvider>
  </React.StrictMode>,
);