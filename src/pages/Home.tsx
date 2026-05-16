import { useState } from "react";

import PostCard from "@/features/posts/components/PostCard";
import { usePosts } from "@/features/posts/PostContext";
import { useAuth } from "@/features/auth/AuthContext";
import { useFollow } from "@/features/follow/FollowContext";
import { usePageTitle } from "@/hooks/usePageTitle";
import Tabs from "@/components/ui/Tabs";
import { FaBars, FaUserGroup } from "react-icons/fa6";

type FeedTab = "feed" | "following";

export default function Home() {
  usePageTitle("Home");

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

  const tabs: { id: FeedTab; label: string; icon?: React.ReactNode }[] = [
    {
      id: "feed",
      label: "Feed",
      icon: <FaBars className="text-sm" />,
    },
    {
      id: "following",
      label: "Following",
      icon: <FaUserGroup className="text-sm" />,
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
