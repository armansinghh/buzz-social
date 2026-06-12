"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import type { UserProfile } from "@/types/user";

import { auth, db } from "@/lib/firebase";

import {
  signInWithGoogle,
  login as firebaseLogin,
  signUp as firebaseSignup,
  logout as firebaseLogout,
} from "./authService";

import { doc, getDoc } from "firebase/firestore";

type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  profileError: boolean;
  retryProfile: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);
const fetchProfile = async (uid: string): Promise<UserProfile | null> => {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data() as UserProfile;
  return {
    ...data,
    followers: data.followers ?? [],
    following: data.following ?? [],
  };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileError, setProfileError] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setProfileError(false);

      if (!firebaseUser) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const fetchedProfile = await fetchProfile(firebaseUser.uid);
        setUser(firebaseUser);
        setProfile(fetchedProfile);
        setProfileError(false);
      } catch (err) {
        console.error("Failed loading profile:", err);
        // User is authenticated but profile fetch failed (offline/network error)
        // Do NOT set profile to null silently — flag the error instead
        setUser(firebaseUser);
        setProfile(null);
        setProfileError(true);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Retry fetching the profile — called from the error screen
  const retryProfile = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    setProfileError(false);
    try {
      const fetchedProfile = await fetchProfile(auth.currentUser.uid);
      setProfile(fetchedProfile);
    } catch (err) {
      console.error("Retry failed:", err);
      setProfileError(true);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!auth.currentUser) return;
    try {
      const fetchedProfile = await fetchProfile(auth.currentUser.uid);
      if (fetchedProfile) {
        setProfile(fetchedProfile);
        setProfileError(false);
      }
    } catch (err) {
      console.error("Failed refreshing profile:", err);
    }
  };

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
      value={{
        user,
        profile,
        loading,
        profileError,
        retryProfile,
        refreshProfile,
        login,
        signup,
        loginWithGoogle,
        logout,
      }}
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
