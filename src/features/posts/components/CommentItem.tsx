import type { Comment } from "@/features/posts/posts.types";
import { formatRelativeTime } from "@/utils/formatRelativeTime";

interface CommentItemProps {
  comment: Comment;
}

export default function CommentItem({ comment }: CommentItemProps) {
  return (
    <div className="text-sm flex items-start justify-between">
      <div>
        <span className="font-semibold mr-2">{comment.authorId}</span>
        <span className="text-gray-800">{comment.text}</span>

        <div className="text-xs text-gray-400 mt-1">
          {formatRelativeTime(comment.createdAt)}
        </div>
      </div>

      {/* Emoji reactions preview */}
      {comment.reactions.length > 0 && (
        <div className="flex gap-1 ml-2">
          {comment.reactions.map((reaction) => (
            <span
              key={reaction.emoji}
              className="text-xs bg-gray-100 px-1 rounded"
            >
              {reaction.emoji} {reaction.users.length}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}