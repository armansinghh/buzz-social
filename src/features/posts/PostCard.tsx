import { useState } from "react";
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
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const { toggleLike } = usePosts();
  const likeCount = post.likes.length;
  const isLiked = user ? post.likes.includes(user.id) : false;

  return (
    <>
      <div className="bg-white p-4 rounded-xl shadow-sm border" 
        onDoubleClick={() => toggleLike(post.id)}>
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">{post.authorId}</h3>
          <span className="text-xs text-gray-500">
            {formatRelativeTime(post.createdAt)}
          </span>
        </div>

        {/* Media */}
        {post.media && (
          <div
            className="w-full h-96 bg-black rounded-lg mb-3 overflow-hidden cursor-pointer"
            onClick={() => setIsViewerOpen(true)}
          >
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
          onClick={() => toggleLike(post.id)}
          className={`text-sm flex items-center gap-1 ${
            isLiked ? "text-red-500" : "text-gray-500"
          }`}
        >
          ❤️ {likeCount} {likeCount === 1 ? "like" : "likes"}
        </button>
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
