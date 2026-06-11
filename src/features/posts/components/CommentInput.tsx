"use client"

import { useState } from "react";
import { usePosts } from "@/features/posts/PostContext";
import { useAuth } from "@/features/auth/AuthContext";
import Avatar from "@/components/ui/Avatar";

interface CommentInputProps {
  postId: string;
  idPrefix?: string;
}

export default function CommentInput({ postId, idPrefix = "feed" }: CommentInputProps) {
  const { addComment } = usePosts();
  const { profile } = useAuth();
  const [text, setText] = useState("");
  const uniqueId = `comment-${idPrefix}-${postId}`;

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    addComment(postId, trimmed);
    setText("");
  };

  return (
    <div className="flex items-center gap-2">
      <Avatar name={profile?.username ?? "User"} src={profile?.avatar} size="xs" />
      <input
        id={uniqueId}
        name={uniqueId}
        autoComplete="off"
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
        className="flex-1 text-sm outline-none bg-transparent text-(--text-primary) placeholder:text-(--text-muted)"
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