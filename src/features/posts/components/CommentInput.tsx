import { useState } from "react";
import { usePosts } from "@/features/posts/PostContext";
import { useAuth } from "@/features/auth/useAuth";
import Avatar from "@/components/ui/Avatar";

interface CommentInputProps {
  postId: string;
}

export default function CommentInput({ postId }: CommentInputProps) {
  const { addComment } = usePosts();
  const { user } = useAuth();
  const [text, setText] = useState("");

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    addComment(postId, trimmed);
    setText("");
  };

  return (
    <div className="flex items-center gap-2">
      <Avatar name={user?.id ?? "guest"} size="xs" />
      <input
        type="text"
        placeholder="Add a comment…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit();
          }
        }}
        className="flex-1 text-sm outline-none bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
      />
      {text.trim() && (
        <button
          onClick={handleSubmit}
          className="text-xs font-semibold text-blue-500 hover:text-blue-400 transition-colors"
        >
          Post
        </button>
      )}
    </div>
  );
}