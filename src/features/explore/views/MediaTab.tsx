import { useState } from "react";
import { usePosts } from "@/features/posts/PostContext";
import EmptyState from "@/components/ui/EmptyState";
import MediaGridItem from "../components/MediaGridItem";
import MediaLightbox from "../components/MediaLightbox";
import GridSkeleton from "@/components/skeletons/GridSkeleton";
import type { Post } from "@/types/post";

const MediaEmptyIcon = (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

export default function MediaTab() {
  const { posts, hasMore, loadMorePosts } = usePosts();
  const [lightboxPost, setLightboxPost] = useState<Post | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const mediaPosts = posts.filter((p) => p.media);

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
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-(--text-muted) mb-3">
        {posts.length === 0
          ? "Loading…"
          : `${mediaPosts.length} ${mediaPosts.length === 1 ? "photo / video" : "photos & videos"}`}
      </h2>
      {posts.length === 0 ? (
        <GridSkeleton />
      ) : mediaPosts.length === 0 ? (
        <EmptyState icon={MediaEmptyIcon} title="No media posts yet" subtitle="Posts with photos or videos will appear here" />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-1.5">
            {mediaPosts.map((p) => (
              <MediaGridItem key={p.id} post={p} onClick={() => setLightboxPost(p)} />
            ))}
          </div>
          {hasMore && (
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

      {lightboxPost && (
        <MediaLightbox
          post={lightboxPost}
          mediaPosts={mediaPosts}
          onClose={() => setLightboxPost(null)}
          onNavigate={setLightboxPost}
        />
      )}
    </section>
  );
}