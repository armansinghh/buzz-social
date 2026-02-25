import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/app/App";
import { AuthProvider } from "@/features/auth/AuthContext";
import { UIProvider } from "@/features/ui/UIContext";
import { NotificationProvider } from "@/features/notifications/NotificationContext";
import "@/index.css";
import { PostProvider } from "@/features/posts/PostContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <UIProvider>
        <NotificationProvider>
          <PostProvider>
            <App />
          </PostProvider>
        </NotificationProvider>
      </UIProvider>
    </AuthProvider>
  </React.StrictMode>,
);
