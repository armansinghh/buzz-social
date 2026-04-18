import { useState } from "react";

import PostCard from "@/features/posts/components/PostCard";
import { usePosts } from "@/features/posts/PostContext";
import { useAuth } from "@/features/auth/AuthContext";
import { useFollow } from "@/features/follow/FollowContext";
import Tabs from "@/components/ui/Tabs";

type FeedTab = "feed" | "following";

export default function Home() {
  const { posts, hasMore, loadMorePosts } = usePosts();

  const { user } = useAuth();
  const { following } = useFollow();

  const [activeTab, setActiveTab] = useState<FeedTab>("feed");

  const [loadingMore, setLoadingMore] = useState(false);

  const currentUserId = user?.uid;

  const followingPosts = posts.filter(
    (post) =>
      post.authorId === currentUserId || following.includes(post.authorId),
  );

  const displayedPosts = activeTab === "feed" ? posts : followingPosts;

  const handleLoadMore = async () => {
    try {
      setLoadingMore(true);

      await loadMorePosts();
    } finally {
      setLoadingMore(false);
    }
  };

  const tabs = [
    {
      id: "feed",
      label: "Feed",
      icon: (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 12h18" />
          <path d="M3 6h18" />
          <path d="M3 18h18" />
        </svg>
      ),
    },
    {
      id: "following",
      label: "Following",
      icon: (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
  ];
  return (
    <div className="space-y-6">
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(key) => setActiveTab(key as any)}
      />

      {/* Posts */}
      {displayedPosts.length === 0 ? (
        <div className="text-center py-10 text-(--text-muted)">
          {activeTab === "following"
            ? "No posts from people you follow yet."
            : "No posts available."}
        </div>
      ) : (
        <>
          {displayedPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}

          {/* Load More */}
          {hasMore && activeTab === "feed" && (
            <div className="flex justify-center pt-4">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-5 py-2 rounded-xl bg-(--bg-primary) border border-(--border-color) text-sm hover:bg-(--bg-secondary) transition"
              >
                {loadingMore ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
