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
  refreshProfile: () => Promise<void>;
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);

      if (!firebaseUser) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const ref = doc(db, "users", firebaseUser.uid);
        const snap = await getDoc(ref);

        let fetchedProfile: UserProfile | null = null;

        if (snap.exists()) {
          const data = snap.data() as UserProfile;
          fetchedProfile = {
            ...data,
            // These array fields belong to AuthContext's old follow system which
            // has been removed. FollowContext owns follow state via subcollections.
            // Keep them here only so existing Firestore docs don't break the shape.
            followers: data.followers ?? [],
            following: data.following ?? [],
          };
        }

        // Set both together so consumers never see a user without a profile
        setUser(firebaseUser);
        setProfile(fetchedProfile);
      } catch (err) {
        console.error("Failed loading profile:", err);
        setUser(firebaseUser);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (!auth.currentUser) return;

    const ref = doc(db, "users", auth.currentUser.uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data() as UserProfile;
      setProfile({
        ...data,
        followers: data.followers ?? [],
        following: data.following ?? [],
      });
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