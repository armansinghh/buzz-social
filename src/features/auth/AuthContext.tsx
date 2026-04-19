import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import type { UserProfile } from "@/types/user";

import { auth } from "@/lib/firebase";
import { db } from "@/lib/firebase";

import {
  signInWithGoogle,
  login as firebaseLogin,
  signUp as firebaseSignup,
  logout as firebaseLogout,
} from "./authService";

import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;

  refreshProfile: () => Promise<void>;

  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;

  followUser: (targetUserId: string) => Promise<void>;
  unfollowUser: (targetUserId: string) => Promise<void>;
  isFollowing: (targetUserId: string) => boolean;
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

        let fetchedProfile = null;

        if (snap.exists()) {
          const data = snap.data() as UserProfile;

          fetchedProfile = {
            ...data,
            followers: data.followers ?? [],
            following: data.following ?? [],
          };
        }

        // SET TOGETHER ONLY AFTER EVERYTHING READY
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

  const followUser = async (targetUserId: string) => {
    if (!user || user.uid === targetUserId) return;

    const currentUserRef = doc(db, "users", user.uid);
    const targetUserRef = doc(db, "users", targetUserId);

    await updateDoc(currentUserRef, {
      following: arrayUnion(targetUserId),
    });

    await updateDoc(targetUserRef, {
      followers: arrayUnion(user.uid),
    });

    setProfile((prev) =>
      prev
        ? {
            ...prev,
            following: [...(prev.following ?? []), targetUserId],
          }
        : prev,
    );
  };

  const unfollowUser = async (targetUserId: string) => {
    if (!user) return;

    const currentUserRef = doc(db, "users", user.uid);
    const targetUserRef = doc(db, "users", targetUserId);

    await updateDoc(currentUserRef, {
      following: arrayRemove(targetUserId),
    });

    await updateDoc(targetUserRef, {
      followers: arrayRemove(user.uid),
    });

    setProfile((prev) =>
      prev
        ? {
            ...prev,
            following:
              prev.following?.filter((id) => id !== targetUserId) ?? [],
          }
        : prev,
    );
  };

  const isFollowing = (targetUserId: string) => {
    return profile?.following?.includes(targetUserId) ?? false;
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
        
        followUser,
        unfollowUser,
        isFollowing,
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
