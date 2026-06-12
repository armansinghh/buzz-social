"use client";

import { AuthProvider } from "@/features/auth/AuthContext";
import { UIProvider } from "@/contexts/UIContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <UIProvider>
        {children}
      </UIProvider>
    </AuthProvider>
  );
}