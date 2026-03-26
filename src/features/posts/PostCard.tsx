import { useState, useRef } from "react";
import type { Post } from "@/features/posts/posts.types";
import { useAuth } from "@/features/auth/useAuth";
import MediaViewerModal from "@/features/posts/components/MediaViewerModal";
import CommentInput from "@/features/posts/components/CommentInput";
import CommentItem from "@/features/posts/components/CommentItem";
import { formatRelativeTime } from "@/utils/formatRelativeTime";
import { usePosts } from "./PostContext";
import { useUI } from "@/features/ui/UIContext";
import Avatar from "@/components/ui/Avatar";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const { toggleLike, likePost } = usePosts();
  const { openComments } = useUI();

  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [showHeart, setShowHeart] = useState(false);

  const clickTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const likeCount = post.likes.length;
  const isLiked = user ? post.likes.includes(user.id) : false;

  const triggerHeart = () => {
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 700);
  };

  const handleCardClick = () => {
    if (!post.media) return;
    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current);
      clickTimeout.current = null;
      triggerHeart();
      likePost(post.id);
    } else {
      clickTimeout.current = setTimeout(() => {
        setIsViewerOpen(true);
        clickTimeout.current = null;
      }, 250);
    }
  };

  return (
    <>
      <article
        className="relative bg-(--bg-primary) rounded-2xl border border-(--border-color) overflow-hidden fade-in"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <div className="flex items-center gap-2.5">
            <Avatar name={post.authorId} size="sm" />
            <div>
              <p className="text-sm font-semibold text-(--text-primary) leading-tight">
                {post.authorId}
              </p>
              <p className="text-xs text-(--text-muted)">
                {formatRelativeTime(post.createdAt)}
              </p>
            </div>
          </div>
          {/* Options button */}
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-(--text-muted) hover:bg-(--bg-tertiary) hover:text-(--text-primary) transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.5"/>
              <circle cx="12" cy="12" r="1.5"/>
              <circle cx="12" cy="19" r="1.5"/>
            </svg>
          </button>
        </div>

        {/* Media */}
        {post.media && (
          <div
            className="w-full bg-(--bg-tertiary) cursor-pointer overflow-hidden"
            style={{ maxHeight: "400px" }}
            onClick={handleCardClick}
          >
            {post.media.type === "image" ? (
              <img
                src={post.media.url}
                alt="Post media"
                className="w-full object-cover"
                style={{ maxHeight: "400px" }}
              />
            ) : (
              <video
                src={post.media.url}
                className="w-full object-cover"
                style={{ maxHeight: "400px" }}
                muted
              />
            )}
          </div>
        )}

        {/* Content */}
        <div className="px-4 pb-4">
          {/* Caption */}
          {post.caption && (
            <p className="text-sm text-(--text-primary) mt-3 leading-relaxed">
              <span className="font-semibold mr-1.5">{post.authorId}</span>
              {post.caption}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1 mt-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLike(post.id);
              }}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm font-medium transition-all
                ${isLiked
                  ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                  : "text-(--text-secondary) hover:bg-(--bg-tertiary)"
                }`}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill={isLiked ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span>{likeCount}</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                openComments(post.id);
              }}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm font-medium text-(--text-secondary) hover:bg-(--bg-tertiary) transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>{post.comments.length}</span>
            </button>
          </div>

          {/* Latest comment */}
          {post.comments.length > 0 && (
            <div className="mt-2 space-y-1.5" onClick={(e) => e.stopPropagation()}>
              <CommentItem
                comment={post.comments[post.comments.length - 1]}
                postId={post.id}
              />
              {post.comments.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openComments(post.id);
                  }}
                  className="text-xs text-(--text-muted) hover:text-(--text-secondary) transition-colors"
                >
                  View all {post.comments.length} comments
                </button>
              )}
            </div>
          )}

          {/* Comment input */}
          <div
            className="mt-3 pt-3 border-t border-(--border-color)"
            onClick={(e) => e.stopPropagation()}
          >
            <CommentInput postId={post.id} />
          </div>
        </div>

        {/* Heart burst overlay */}
        {showHeart && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="text-7xl animate-heart-burst drop-shadow-lg">❤️</span>
          </div>
        )}
      </article>

      <MediaViewerModal
        isOpen={isViewerOpen}
        media={post.media ?? null}
        onClose={() => setIsViewerOpen(false)}
      />
    </>
  );
}