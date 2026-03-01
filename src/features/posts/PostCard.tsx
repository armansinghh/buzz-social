import type { Post } from "@/features/posts/posts.types";
import { useAuth } from "@/features/auth/useAuth";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();

  const likeCount = post.likes.length;
  const isLiked = user ? post.likes.includes(user.id) : false;

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold">{post.authorId}</h3>
        <span className="text-xs text-gray-500">
          {new Date(post.createdAt).toLocaleString()}
        </span>
      </div>

      {/* Media */}
      {post.media && (
        <div className="w-full h-96 bg-black rounded-lg mb-3 overflow-hidden">
          {post.media.type === "image" ? (
            <img
              src={post.media.url}
              alt="Post media"
              className="w-full h-full object-cover"
            />
          ) : (
            <video
              src={post.media.url}
              controls
              className="w-full h-full object-cover"
            />
          )}
        </div>
      )}

      {/* Caption */}
      {post.caption && (
        <p className="text-gray-800 mb-3">
          {post.caption}
        </p>
      )}

      {/* Likes */}
      <div
        className={`text-sm ${
          isLiked ? "text-red-500" : "text-gray-500"
        }`}
      >
        ❤️ {likeCount} {likeCount === 1 ? "like" : "likes"}
      </div>
    </div>
  );
}