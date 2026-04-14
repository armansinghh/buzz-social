import { useState } from "react";

import PostCard from "@/features/posts/PostCard";
import { usePosts } from "@/features/posts/PostContext";
import { useAuth } from "@/features/auth/AuthContext";
import { useFollow } from "@/features/follow/FollowContext";

type FeedTab = "feed" | "following";

export default function Home() {
  const { posts } = usePosts();
  const { user } = useAuth();
  const { following } = useFollow();

  const [activeTab, setActiveTab] =
    useState<FeedTab>("feed");

  const currentUserId = user?.uid;

  const followingPosts = posts.filter(
    (post) =>
      post.authorId === currentUserId ||
      following.includes(post.authorId)
  );

  const displayedPosts =
    activeTab === "feed"
      ? posts
      : followingPosts;

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-(--border-color)">
        <button
          onClick={() => setActiveTab("feed")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            activeTab === "feed"
              ? "border-blue-500 text-(--text-primary)"
              : "border-transparent text-(--text-muted)"
          }`}
        >
          Feed
        </button>

        <button
          onClick={() =>
            setActiveTab("following")
          }
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            activeTab === "following"
              ? "border-blue-500 text-(--text-primary)"
              : "border-transparent text-(--text-muted)"
          }`}
        >
          Following 
        </button>
      </div>

      {/* Posts */}
      {displayedPosts.length === 0 ? (
        <div className="text-center py-10 text-(--text-muted)">
          {activeTab === "following"
            ? "No posts from people you follow yet."
            : "No posts available."}
        </div>
      ) : (
        displayedPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
          />
        ))
      )}
    </div>
  );
}