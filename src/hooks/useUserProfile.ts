import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { UserProfile } from "@/types/user";

// Module-level cache — survives re-renders, shared across all component instances
const profileCache = new Map<string, UserProfile>();
// Track in-flight requests so multiple components asking for the same uid
// don't fire duplicate Firestore reads
const inFlight = new Map<string, Promise<UserProfile | null>>();

export function useUserProfile(uid: string | undefined) {
  const [profile, setProfile] = useState<UserProfile | null>(
    uid ? (profileCache.get(uid) ?? null) : null
  );
  const [isLoading, setIsLoading] = useState(
    !!uid && !profileCache.has(uid)
  );

  useEffect(() => {
    if (!uid) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    // Already cached — use it immediately, no loading state
    if (profileCache.has(uid)) {
      setProfile(profileCache.get(uid)!);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Deduplicate concurrent fetches for the same uid
    if (!inFlight.has(uid)) {
      const promise = getDoc(doc(db, "users", uid))
        .then((snap) => {
          if (!snap.exists()) return null;
          const data = snap.data() as UserProfile;
          const p = { ...data, uid: snap.id };
          profileCache.set(uid, p);
          return p;
        })
        .finally(() => {
          inFlight.delete(uid);
        });
      inFlight.set(uid, promise);
    }

    inFlight.get(uid)!.then((p) => {
      setProfile(p);       // set even if null — don't skip null results
      setIsLoading(false);
    });
  }, [uid]);

  return { profile, isLoading };
}

// Call this after a profile save so the next render gets fresh data
export function invalidateUserProfile(uid: string) {
  profileCache.delete(uid);
}