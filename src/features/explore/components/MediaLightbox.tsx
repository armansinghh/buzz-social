"use client"

import { useEffect } from "react";
import { FaHeart, FaComment } from "react-icons/fa6";
import Avatar from "@/components/ui/Avatar";
import { useUserProfile } from "@/hooks/useUserProfile";
import type { Post } from "@/types/post";
import Link from "next/link";

export default function MediaLightbox({
  post,
  mediaPosts,
  onClose,
  onNavigate,
}: {
  post: Post;
  mediaPosts: Post[];
  onClose: () => void;
  onNavigate: (p: Post) => void;
}) {
  const idx = mediaPosts.findIndex((p) => p.id === post.id);
  const hasPrev = idx > 0;
  const hasNext = idx < mediaPosts.length - 1;

  const { profile: authorProfile } = useUserProfile(post.authorId);

  const authorUsername =
    authorProfile?.username ||
    authorProfile?.name ||
    post.authorUsername ||
    "User";
  const authorAvatar =
    authorProfile?.avatar || authorProfile?.photoURL || post.authorAvatar;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onNavigate(mediaPosts[idx - 1]);
      if (e.key === "ArrowRight" && hasNext) onNavigate(mediaPosts[idx + 1]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, hasPrev, hasNext, onClose, onNavigate, mediaPosts]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-(--bg-primary) w-full max-w-2xl mx-4 rounded-2xl overflow-hidden border border-(--border-color) modal-in"
        style={{ boxShadow: "var(--shadow-md)", maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {post.media && (
          <div className="relative bg-black max-h-[60vh] flex items-center justify-center overflow-hidden">
            {post.media.type === "image" ? (
              <img
                src={post.media.url}
                alt=""
                className="w-full max-h-[60vh] object-contain"
              />
            ) : (
              <video
                src={post.media.url}
                controls
                autoPlay
                className="w-full max-h-[60vh] object-contain"
              />
            )}
            {hasPrev && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate(mediaPosts[idx - 1]);
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                aria-label="Previous"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            )}
            {hasNext && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate(mediaPosts[idx + 1]);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                aria-label="Next"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            )}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-black/50 rounded-full text-white text-xs font-medium">
              {idx + 1} / {mediaPosts.length}
            </div>
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-4">
          <div className="flex items-center gap-2.5 mb-2">
            <Link
              href={`/profile/${authorUsername || post.authorId}`}
              className="flex items-center gap-2.5 group w-fit"
            >
              <Avatar name={authorUsername} src={authorAvatar} size="sm" />
              <p className="text-sm font-semibold text-(--text-primary)">
                {authorUsername}
              </p>
            </Link>
          </div>
          {post.caption && (
            <p className="text-sm text-(--text-primary) leading-relaxed">
              {post.caption}
            </p>
          )}
          <div className="flex items-center gap-4 mt-3 text-xs text-(--text-muted)">
            <span className="flex items-center justify-center gap-1 whitespace-nowrap">
              <FaHeart /> {post.likes.length} likes
            </span>
            <span className="flex items-center justify-center gap-1 whitespace-nowrap">
              <FaComment /> {post.comments.length} comments
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
