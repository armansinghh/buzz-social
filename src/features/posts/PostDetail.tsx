"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { usePosts } from "@/features/posts/PostContext";

import PostCard from "@/features/posts/components/PostCard";
import type { Post } from "@/types/post";
import { mapPost } from "@/services/postMapper";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function PostDetail() {
  const { id } = useParams();
  usePageTitle("Post Details");

  const { posts } = usePosts();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      if (!id) return;

      const resolvedId = Array.isArray(id) ? id[0] : id;

      // 1. Try from context
      const existing = posts.find((p) => p.id === resolvedId);

      if (existing) {
        setPost(existing);
        setLoading(false);
        return;
      }

      // 2. Fetch from Firestore
      try {
        const ref = doc(db, "posts", resolvedId);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setPost(mapPost(snap.id, snap.data()));
        }
      } catch (err) {
        console.error("Failed to fetch post:", err);
      }

      setLoading(false);
    };

    loadPost();
  }, [id, posts]);

  if (loading) {
    return (
      <div className="text-center py-10 text-(--text-muted)">
        Loading post...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-10 text-(--text-muted)">
        Post not found.
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {/* Post */}
      <PostCard post={post} />
    </div>
  );
}
