import { useEffect } from "react";
import { useUI } from "@/features/ui/UIContext";
import { usePosts } from "@/features/posts/PostContext";
import CommentItem from "./CommentItem";
import CommentInput from "./CommentInput";
import { formatRelativeTime } from "@/utils/formatRelativeTime";
import Avatar from "@/components/ui/Avatar";

export default function CommentsModal() {
  const { activeModal, commentsPostId, closeModal } = useUI();
  const { posts } = usePosts();

  const isOpen = activeModal === "comments";
  const post = posts.find((p) => p.id === commentsPostId);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, closeModal]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen || !post) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={closeModal}
    >
      <div
        className="bg-[var(--bg-primary)] w-full sm:max-w-4xl sm:h-[85vh] h-[90vh] sm:rounded-2xl rounded-t-2xl overflow-hidden flex flex-col sm:flex-row modal-in border border-[var(--border-color)]"
        style={{ boxShadow: "var(--shadow-md)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* LEFT — POST PREVIEW */}
        <div className="sm:w-1/2 border-b sm:border-b-0 sm:border-r border-[var(--border-color)] flex flex-col hidden sm:flex">
          {/* Post header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border-color)]">
            <Avatar name={post.authorId} size="sm" />
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">{post.authorId}</p>
              <p className="text-xs text-[var(--text-muted)]">{formatRelativeTime(post.createdAt)}</p>
            </div>
          </div>

          {/* Media */}
          {post.media && (
            <div className="flex-1 bg-black overflow-hidden">
              {post.media.type === "image" ? (
                <img src={post.media.url} className="w-full h-full object-contain" alt="Post" />
              ) : (
                <video src={post.media.url} controls className="w-full h-full object-contain" />
              )}
            </div>
          )}

          {/* Caption + likes */}
          <div className="px-5 py-4 space-y-2">
            {post.caption && (
              <p className="text-sm text-[var(--text-primary)]">
                <span className="font-semibold mr-1.5">{post.authorId}</span>
                {post.caption}
              </p>
            )}
            <p className="text-xs text-[var(--text-muted)]">
              ❤️ {post.likes.length} {post.likes.length === 1 ? "like" : "likes"}
            </p>
          </div>
        </div>

        {/* RIGHT — COMMENTS */}
        <div className="flex-1 sm:w-1/2 flex flex-col min-h-0">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-color)] flex-shrink-0">
            <h3 className="font-semibold text-[var(--text-primary)]">Comments</h3>
            <button
              onClick={closeModal}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Mobile post caption */}
          <div className="sm:hidden px-5 py-3 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-2.5">
              <Avatar name={post.authorId} size="xs" />
              <p className="text-sm text-[var(--text-primary)]">
                <span className="font-semibold mr-1.5">{post.authorId}</span>
                {post.caption}
              </p>
            </div>
          </div>

          {/* Comments list */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 main-scroll">
            {post.comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-[var(--text-muted)]">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <p className="text-sm">No comments yet</p>
                <p className="text-xs">Be the first to comment!</p>
              </div>
            ) : (
              post.comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} postId={post.id} />
              ))
            )}
          </div>

          {/* Input */}
          <div className="border-t border-[var(--border-color)] px-5 py-4 flex-shrink-0">
            <CommentInput postId={post.id} />
          </div>
        </div>
      </div>
    </div>
  );
}