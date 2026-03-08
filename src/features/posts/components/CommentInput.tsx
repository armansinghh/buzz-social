import { useState } from "react";
import { usePosts } from "@/features/posts/PostContext";

interface CommentInputProps {
  postId: string;
}

export default function CommentInput({ postId }: CommentInputProps) {
  const { addComment } = usePosts();
  const [text, setText] = useState("");

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    addComment(postId, trimmed);
    setText("");
  };

  return (
    <div className="flex items-center gap-2 border-t pt-2">
      <input
        type="text"
        placeholder="Add a comment..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit();
          }
        }}
        className="flex-1 text-sm outline-none"
      />

      <button
        onClick={handleSubmit}
        className="text-sm font-semibold text-blue-500 hover:text-blue-600"
      >
        Post
      </button>
    </div>
  );
}