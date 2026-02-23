import { Post } from "@/types/post";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">{post.author}</h3>
        <span className="text-xs text-gray-500">
          {post.createdAt}
        </span>
      </div>

      <p className="text-gray-800 mb-3">
        {post.content}
      </p>

      <div className="text-sm text-gray-500">
        ❤️ {post.likes} likes
      </div>
    </div>
  );
}