import { useState, useRef } from "react";
import type { Post } from "@/features/posts/posts.types";
import { useAuth } from "@/features/auth/useAuth";
import MediaViewerModal from "@/features/posts/components/MediaViewerModal";
import { formatRelativeTime } from "@/utils/formatRelativeTime";
import { usePosts } from "./PostContext";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const { toggleLike, likePost } = usePosts();

  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [showHeart, setShowHeart] = useState(false);

  const clickTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const likeCount = post.likes.length;
  const isLiked = user ? post.likes.includes(user.id) : false;

  const triggerHeart = () => {
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 700);
  };

  return (
    <>
      <div
        className="relative bg-white p-4 rounded-xl shadow-sm border"
        onClick={() => {
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
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">{post.authorId}</h3>
          <span className="text-xs text-gray-500">
            {formatRelativeTime(post.createdAt)}
          </span>
        </div>

        {/* Media */}
        {post.media && (
          <div className="w-full h-96 bg-black rounded-lg mb-3 overflow-hidden cursor-pointer">
            {post.media.type === "image" ? (
              <img
                src={post.media.url}
                alt="Post media"
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={post.media.url}
                className="w-full h-full object-cover"
                muted
              />
            )}
          </div>
        )}

        {/* Caption */}
        {post.caption && <p className="text-gray-800 mb-3">{post.caption}</p>}

        {/* Likes */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // prevent card click logic
            toggleLike(post.id);
          }}
          className={`text-sm flex items-center gap-1 ${
            isLiked ? "text-red-500" : "text-gray-500"
          }`}
        >
          ❤️ {likeCount} {likeCount === 1 ? "like" : "likes"}
        </button>

        {/* ❤️ Heart Burst Overlay */}
        {showHeart && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="text-white text-7xl animate-heart-burst drop-shadow-lg">
              ❤️
            </span>
          </div>
        )}
      </div>

      {/* Fullscreen Viewer */}
      <MediaViewerModal
        isOpen={isViewerOpen}
        media={post.media ?? null}
        onClose={() => setIsViewerOpen(false)}
      />
    </>
  );
}
