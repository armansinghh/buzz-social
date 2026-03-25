import { useRef } from "react";
import type { Comment } from "@/features/posts/posts.types";
import { formatRelativeTime } from "@/utils/formatRelativeTime";
import { usePosts } from "@/features/posts/PostContext";
import { useAuth } from "@/features/auth/useAuth";
import { useUI } from "@/features/ui/UIContext";
import Avatar from "@/components/ui/Avatar";

interface CommentItemProps {
  comment: Comment;
  postId: string;
}

export default function CommentItem({ comment, postId }: CommentItemProps) {
  const { toggleReaction } = usePosts();
  const { user } = useAuth();
  const { openEmojiPicker, closeEmojiPicker, emojiPicker } = useUI();

  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const userId = user?.id ?? "guest";

  const handleOpenPicker = () => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();

    const pickerHeight = 360;

    let y = rect.top - pickerHeight - 8;
    let x = rect.left + rect.width / 2 - 160; // center align

    if (y < 8) y = rect.bottom + 8;

    const maxX = window.innerWidth - 320;
    if (x > maxX) x = maxX;
    if (x < 8) x = 8;

    // Toggle behavior
    if (
      emojiPicker &&
      emojiPicker.commentId === comment.id
    ) {
      closeEmojiPicker();
      return;
    }

    openEmojiPicker(comment.id, postId, { x, y });
  };

  return (
    <div className="flex gap-2">
      <Avatar name={comment.authorId} size="xs" className="mt-0.5 flex-shrink-0" />

      <div className="flex-1 min-w-0">
        <div className="text-sm">
          <span className="font-semibold text-[var(--text-primary)] mr-1.5">
            {comment.authorId}
          </span>
          <span className="text-[var(--text-primary)]">{comment.text}</span>
        </div>

        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-xs text-[var(--text-muted)]">
            {formatRelativeTime(comment.createdAt)}
          </span>

          {/* Reactions */}
          {comment.reactions.map((reaction) => {
            const reactedByUser = reaction.users.includes(userId);

            return (
              <button
                key={reaction.emoji}
                onClick={() =>
                  toggleReaction(postId, comment.id, reaction.emoji)
                }
                className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full transition-colors
                  ${
                    reactedByUser
                      ? "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                      : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--border-color)]"
                  }`}
              >
                <span>{reaction.emoji}</span>
                <span className="font-medium">
                  {reaction.users.length}
                </span>
              </button>
            );
          })}

          {/* Add reaction */}
          <button
            ref={buttonRef}
            onClick={handleOpenPicker}
            className="text-xs px-1.5 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:bg-[var(--border-color)] hover:text-[var(--text-secondary)] transition-colors"
          >
            + React
          </button>
        </div>
      </div>
    </div>
  );
}