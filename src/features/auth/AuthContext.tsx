import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, getRedirectResult } from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  signInWithGoogle,
  login as firebaseLogin,
  signUp as firebaseSignup,
  logout as firebaseLogout,
  saveUser,
} from "./authService";

import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type UserProfile = {
  username?: string;
  name?: string;
  photoURL?: string;
};

type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Handle Google redirect result (prod only)
useEffect(() => {
  let isRedirectHandled = false;

  const initAuth = async () => {
    try {
      const result = await getRedirectResult(auth);

      if (result?.user) {
        console.log("Redirect login detected");

        await saveUser(result.user);
        isRedirectHandled = true;

        window.location.replace("/");
      }
    } catch (err) {
      console.error("Redirect sign-in error:", err);
    }
  };

  initAuth();

  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    console.log("Auth state user:", user);

    // If redirect already handled, skip
    if (isRedirectHandled) return;

    // allback: user logged in but no redirect result
    window.location.replace("/");
  });

  return () => unsubscribe();
}, []);

  // Core persistent auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data() as UserProfile;
          setProfile({
            ...data,
            photoURL: data.photoURL ?? user.photoURL ?? "",
          });
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    await firebaseLogin(email, password);
  };

  const signup = async (email: string, password: string) => {
    await firebaseSignup(email, password);
  };

  const loginWithGoogle = async () => {
    await signInWithGoogle();
  };

  const logout = async () => {
    await firebaseLogout();
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, login, signup, loginWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
