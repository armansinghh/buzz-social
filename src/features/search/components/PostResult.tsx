import { useNavigate } from "react-router-dom";
import Avatar from "@/components/ui/Avatar";
import { timeAgo, highlightText } from "../utils/searchUtils";
import type { Post } from "@/types/post";

export default function PostResult({ post, query }: { post: Post; query: string }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/post/${post.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/post/${post.id}`)}
      className="flex gap-3 p-3.5 bg-(--bg-primary) rounded-2xl border border-(--border-color) hover:border-(--text-muted) transition-all cursor-pointer"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      {post.media?.type === "image" && (
        <img
          src={post.media.url}
          alt=""
          className="w-16 h-16 rounded-xl object-cover shrink-0 bg-(--bg-tertiary)"
        />
      )}
      {post.media?.type === "video" && (
        <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-(--bg-tertiary)">
          <video src={post.media.url} className="w-full h-full object-cover" muted />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <Avatar
            name={post.authorUsername || "User"}
            src={post.authorAvatar}
            size="xs"
          />
          <span className="text-xs font-semibold text-(--text-primary) truncate">
            {post.authorUsername || "User"}
          </span>
          <span className="text-xs text-(--text-muted) shrink-0">
            · {timeAgo(post.createdAt)}
          </span>
        </div>

        {post.caption && (
          <p className="text-sm text-(--text-primary) line-clamp-2 leading-relaxed">
            {highlightText(post.caption, query)}
          </p>
        )}

        <div className="flex items-center gap-3 mt-1.5">
          <span className="flex items-center gap-1 text-xs text-(--text-muted)">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {post.likes.length}
          </span>
          <span className="flex items-center gap-1 text-xs text-(--text-muted)">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {post.comments.length}
          </span>
        </div>
      </div>
    </div>
  );
}