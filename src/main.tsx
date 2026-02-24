import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/app/App";
import { AuthProvider } from "@/features/auth/AuthContext";
import { UIProvider } from "@/features/ui/UIContext";
import "@/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <UIProvider>
        <App />
      </UIProvider>
    </AuthProvider>
  </React.StrictMode>
);
