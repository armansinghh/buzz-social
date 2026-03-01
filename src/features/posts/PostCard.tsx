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
      {post.mediaUrl && (
        <img
          src={post.mediaUrl}
          alt="Post media"
          className="w-full rounded-lg mb-3 object-cover"
        />
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