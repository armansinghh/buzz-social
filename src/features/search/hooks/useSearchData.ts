"use client"

import { useState, useEffect } from "react";
import { collection, getDocs, orderBy, query, where, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useDebounce } from "@/hooks/useDebounce";
import type { Post } from "@/types/post";

const POSTS_SEARCH_LIMIT = 20;

export interface SearchUser {
  uid: string;
  username: string;
  name: string;
  avatar?: string;
}

export function useSearchData() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    const searchAll = async () => {
      if (!debouncedSearch.trim()) {
        setUsers([]);
        setPosts([]);
        setHasSearched(false);
        return;
      }

      setLoading(true);
      try {
        const term = debouncedSearch.toLowerCase();

        const usersQuery = query(
          collection(db, "users"),
          orderBy("username"),
          where("username", ">=", term),
          where("username", "<=", term + "\uf8ff"),
        );

        const postsQuery = query(
          collection(db, "posts"),
          orderBy("createdAt", "desc"),
          limit(POSTS_SEARCH_LIMIT),
        );

        const [usersSnap, postsSnap] = await Promise.all([
          getDocs(usersQuery),
          getDocs(postsQuery),
        ]);

        const userResults = usersSnap.docs.map(
          (doc) => doc.data() as SearchUser,
        );

        const allPosts = postsSnap.docs.map((d) => ({
          ...(d.data() as Omit<Post, "id">),
          id: d.id,
        })) as Post[];

        const postResults = allPosts.filter(
          (p) =>
            p.caption?.toLowerCase().includes(term) ||
            p.authorUsername?.toLowerCase().includes(term),
        );

        setUsers(userResults);
        setPosts(postResults);
        setHasSearched(true);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    };

    searchAll();
  }, [debouncedSearch]);

  const clearSearch = () => {
    setSearch("");
    setUsers([]);
    setPosts([]);
    setHasSearched(false);
  };

  return {
    search,
    setSearch,
    debouncedSearch,
    users,
    posts,
    loading,
    hasSearched,
    clearSearch,
  };
}