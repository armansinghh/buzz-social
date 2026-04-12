import { createContext, useContext, useState, useCallback } from "react";
import { useAuth } from "@/features/auth/AuthContext";

interface FollowContextType {
  following: string[];       // list of uids the current user follows
  followers: Record<string, string[]>; // uid -> list of their followers
  followUser: (targetUid: string) => void;
  unfollowUser: (targetUid: string) => void;
  isFollowing: (targetUid: string) => boolean;
  getFollowerCount: (targetUid: string) => number;
  getFollowingCount: () => number;
}

const FollowContext = createContext<FollowContextType | undefined>(undefined);

export function FollowProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  // following: set of uids that current user follows
  const [following, setFollowing] = useState<string[]>([]);
  // followers: map of uid -> array of follower uids
  const [followers, setFollowers] = useState<Record<string, string[]>>({});

  const followUser = useCallback(
    (targetUid: string) => {
      if (!user || targetUid === user.uid) return;

      setFollowing((prev) =>
        prev.includes(targetUid) ? prev : [...prev, targetUid]
      );

      setFollowers((prev) => {
        const current = prev[targetUid] ?? [];
        if (current.includes(user.uid)) return prev;
        return { ...prev, [targetUid]: [...current, user.uid] };
      });
    },
    [user]
  );

  const unfollowUser = useCallback(
    (targetUid: string) => {
      if (!user) return;

      setFollowing((prev) => prev.filter((id) => id !== targetUid));

      setFollowers((prev) => {
        const current = prev[targetUid] ?? [];
        return {
          ...prev,
          [targetUid]: current.filter((id) => id !== user.uid),
        };
      });
    },
    [user]
  );

  const isFollowing = useCallback(
    (targetUid: string) => following.includes(targetUid),
    [following]
  );

  const getFollowerCount = useCallback(
    (targetUid: string) => (followers[targetUid] ?? []).length,
    [followers]
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