"use client"

import { useState } from "react";
import { usePosts } from "@/features/posts/PostContext";
import PostCard from "@/features/posts/components/PostCard";
import PostCardSkeleton from "@/components/skeletons/PostCardSkeleton";
import EmptyState from "@/components/ui/EmptyState";
import TrendingTag from "../components/TrendingTag";
import { trendingScore, extractHashtags, postMatchesTag } from "../utils/trending";

const TrendEmptyIcon = (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

export default function TrendingTab() {
  const { posts, hasMore, loadMorePosts } = usePosts();
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const trendingPosts = activeTag
    ? [...posts]
        .sort((a, b) => trendingScore(b) - trendingScore(a))
        .filter((p) => postMatchesTag(p, activeTag))
    : [...posts].sort((a, b) => trendingScore(b) - trendingScore(a));

  const hashtags = extractHashtags(posts);

  const handleLoadMore = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      await loadMorePosts();
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="space-y-5">
      {hashtags.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-(--text-muted) mb-3 flex items-center gap-2">
            Topics
          </h2>
          <div
            className="bg-(--bg-primary) rounded-2xl border border-(--border-color) divide-y divide-(--border-color) overflow-hidden"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            {hashtags.map((ht, i) => (
              <TrendingTag
                key={ht.tag}
                tag={ht.tag}
                count={ht.count}
                rank={i + 1}
                active={activeTag === ht.tag}
                onClick={() => setActiveTag(activeTag === ht.tag ? null : ht.tag)}
              />
            ))}
          </div>
        </section>
      )}

      {activeTag && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-(--text-muted)">Showing posts for</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-(--accent) text-(--bg-primary) text-xs font-semibold rounded-full">
            {activeTag}
            <button onClick={() => setActiveTag(null)} className="opacity-70 hover:opacity-100">
              ✕
            </button>
          </span>
        </div>
      )}

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-(--text-muted) mb-3 flex items-center gap-2">
          {activeTag ? "Matching posts" : "Trending now"}
        </h2>

        {posts.length === 0 ? (
          activeTag ? (
            <EmptyState icon={TrendEmptyIcon} title={`No posts tagged ${activeTag}`} subtitle="Try a different topic above" />
          ) : (
            <div className="space-y-4"><PostCardSkeleton /><PostCardSkeleton /></div>
          )
        ) : trendingPosts.length === 0 ? (
          <EmptyState icon={TrendEmptyIcon} title="Nothing trending yet" subtitle="Be the first to post something!" />
        ) : (
          <>
            <div className="space-y-4">
              {trendingPosts.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
            {!activeTag && hasMore && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-5 py-2 rounded-xl bg-(--bg-primary) border border-(--border-color) text-sm hover:bg-(--bg-secondary) transition"
                >
                  {loadingMore ? "Loading…" : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}