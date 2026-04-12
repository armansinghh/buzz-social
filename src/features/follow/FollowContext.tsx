import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import {
  doc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface FollowContextType {
  following: string[];
  followers: Record<string, string[]>;
  followUser: (targetUid: string) => void;
  unfollowUser: (targetUid: string) => void;
  isFollowing: (targetUid: string) => boolean;
  getFollowerCount: (targetUid: string) => number;
  getFollowingCount: () => number;
}

const FollowContext = createContext<FollowContextType | undefined>(undefined);

export function FollowProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [following, setFollowing] = useState<string[]>([]);
  const [followers, setFollowers] = useState<Record<string, string[]>>({});

  // Load current user's following list on mount / user change
  useEffect(() => {
    if (!user) {
      setFollowing([]);
      return;
    }

    const loadFollowing = async () => {
      const snap = await getDocs(
        collection(db, "users", user.uid, "following")
      );
      setFollowing(snap.docs.map((d) => d.id));
    };

    loadFollowing();
  }, [user]);

  // Load followers for a given uid (called lazily from getFollowerCount)
  const loadFollowers = useCallback(async (targetUid: string) => {
    const snap = await getDocs(
      collection(db, "users", targetUid, "followers")
    );
    const ids = snap.docs.map((d) => d.id);
    setFollowers((prev) => ({ ...prev, [targetUid]: ids }));
  }, []);

  const followUser = useCallback(
    async (targetUid: string) => {
      if (!user || targetUid === user.uid) return;

      // Optimistic update
      setFollowing((prev) =>
        prev.includes(targetUid) ? prev : [...prev, targetUid]
      );
      setFollowers((prev) => {
        const current = prev[targetUid] ?? [];
        if (current.includes(user.uid)) return prev;
        return { ...prev, [targetUid]: [...current, user.uid] };
      });

      // Persist to Firestore
      await Promise.all([
        setDoc(doc(db, "users", user.uid, "following", targetUid), {
          followedAt: new Date().toISOString(),
        }),
        setDoc(doc(db, "users", targetUid, "followers", user.uid), {
          followedAt: new Date().toISOString(),
        }),
      ]);
    },
    [user]
  );

  const unfollowUser = useCallback(
    async (targetUid: string) => {
      if (!user) return;

      // Optimistic update
      setFollowing((prev) => prev.filter((id) => id !== targetUid));
      setFollowers((prev) => {
        const current = prev[targetUid] ?? [];
        return {
          ...prev,
          [targetUid]: current.filter((id) => id !== user.uid),
        };
      });

      // Remove from Firestore
      await Promise.all([
        deleteDoc(doc(db, "users", user.uid, "following", targetUid)),
        deleteDoc(doc(db, "users", targetUid, "followers", user.uid)),
      ]);
    },
    [user]
  );

  const isFollowing = useCallback(
    (targetUid: string) => following.includes(targetUid),
    [following]
  );

  const getFollowerCount = useCallback(
    (targetUid: string) => {
      if (!(targetUid in followers)) {
        loadFollowers(targetUid);
      }
      return (followers[targetUid] ?? []).length;
    },
    [followers, loadFollowers]
  );

  const getFollowingCount = useCallback(
    () => following.length,
    [following]
  );

  return (
    <FollowContext.Provider
      value={{
        following,
        followers,
        followUser,
        unfollowUser,
        isFollowing,
        getFollowerCount,
        getFollowingCount,
      }}
    >
      {children}
    </FollowContext.Provider>
  );
}

export function useFollow() {
  const ctx = useContext(FollowContext);
  if (!ctx) throw new Error("useFollow must be used within FollowProvider");
  return ctx;
}