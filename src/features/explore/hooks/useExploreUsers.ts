import { useState, useCallback } from "react";
import { collection, getDocs, query, limit, startAfter } from "firebase/firestore";
import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { UserProfile } from "@/types/user";

const USERS_LIMIT = 20;

export function useExploreUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const [lastUserDoc, setLastUserDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loadingMoreUsers, setLoadingMoreUsers] = useState(false);

  const loadUsers = useCallback(async () => {
    if (usersLoaded) return;
    setUsersLoading(true);
    try {
      const q = query(collection(db, "users"), limit(USERS_LIMIT));
      const snap = await getDocs(q);
      const fetched = snap.docs.map((d) => ({
        ...(d.data() as UserProfile),
        uid: d.id,
      }));
      setUsers(fetched);
      setLastUserDoc(snap.docs[snap.docs.length - 1] ?? null);
      setHasMoreUsers(snap.docs.length === USERS_LIMIT);
      setUsersLoaded(true);
    } catch (err) {
      console.error("Users fetch failed:", err);
    } finally {
      setUsersLoading(false);
    }
  }, [usersLoaded]);

  const loadMoreUsers = async () => {
    if (!lastUserDoc || !hasMoreUsers || loadingMoreUsers) return;
    setLoadingMoreUsers(true);
    try {
      const q = query(
        collection(db, "users"),
        startAfter(lastUserDoc),
        limit(USERS_LIMIT)
      );
      const snap = await getDocs(q);
      const fetched = snap.docs.map((d) => ({
        ...(d.data() as UserProfile),
        uid: d.id,
      }));
      setUsers((prev) => [...prev, ...fetched]);
      setLastUserDoc(snap.docs[snap.docs.length - 1] ?? null);
      setHasMoreUsers(snap.docs.length === USERS_LIMIT);
    } catch (err) {
      console.error("Failed loading more users:", err);
    } finally {
      setLoadingMoreUsers(false);
    }
  };

  return {
    users,
    usersLoading,
    hasMoreUsers,
    loadingMoreUsers,
    loadUsers,
    loadMoreUsers,
  };
}