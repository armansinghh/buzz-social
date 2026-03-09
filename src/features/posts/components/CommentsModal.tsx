import { useEffect } from "react";
import { useUI } from "@/features/ui/UIContext";
import { usePosts } from "@/features/posts/PostContext";
import CommentItem from "./CommentItem";
import CommentInput from "./CommentInput";
import { formatRelativeTime } from "@/utils/formatRelativeTime";

export default function CommentsModal() {
  const { activeModal, commentsPostId, closeModal } = useUI();
  const { posts } = usePosts();

  const isOpen = activeModal === "comments";

  const post = posts.find((p) => p.id === commentsPostId);

  // ESC close
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, closeModal]);

  // lock scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !post) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={closeModal}
    >
      <div
        className="bg-white w-full max-w-6xl h-[85vh] rounded-xl overflow-hidden flex"
        onClick={(e) => e.stopPropagation()}
      >
        {/* LEFT PANEL — POST */}
        <div className="w-1/2 border-r p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">{post.authorId}</h3>
            <span className="text-xs text-gray-500">
              {formatRelativeTime(post.createdAt)}
            </span>
          </div>

          {post.caption && (
            <p className="text-gray-800">{post.caption}</p>
          )}

          {post.media && (
            <div className="flex-1 bg-black rounded-lg overflow-hidden">
              {post.media.type === "image" ? (
                <img
                  src={post.media.url}
                  className="w-full h-full object-contain"
                />
              ) : (
                <video
                  src={post.media.url}
                  controls
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          )}

          <div className="text-sm text-gray-500">
            ❤️ {post.likes.length} {post.likes.length === 1 ? "like" : "likes"}
          </div>
        </div>

        {/* RIGHT PANEL — COMMENTS */}
        <div className="w-1/2 flex flex-col">
          {/* header */}
          <div className="border-b px-4 py-3 font-semibold">
            Comments
          </div>

          {/* comments list */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {post.comments.length === 0 ? (
              <p className="text-sm text-gray-400">
                No comments yet
              </p>
            ) : (
              post.comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  postId={post.id}
                />
              ))
            )}
          </div>

          {/* input */}
          <div className="border-t px-4 py-3">
            <CommentInput postId={post.id} />
          </div>
        </div>
      </div>
    </div>
  );
}