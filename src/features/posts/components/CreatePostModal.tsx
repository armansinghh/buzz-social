import { useEffect, useState } from "react";
import { useUI } from "@/features/ui/UIContext";
import { usePosts } from "@/features/posts/PostContext";

export default function CreatePostModal() {
  const { activeModal, closeModal } = useUI();
  const isOpen = activeModal === "createPost";
  const { addPost } = usePosts();
  const [content, setContent] = useState("");

  // always call hooks
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

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // return conditionally AFTER hooks
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={closeModal}
    >
      <div
        className="bg-white w-full max-w-lg rounded-xl p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Create Post</h2>
          <button
            onClick={closeModal}
            className="text-gray-500 hover:text-black"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <label htmlFor="create-post-content" className="sr-only">
            Post Content
          </label>

          <textarea
            id="create-post-content"
            name="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening?"
            className="w-full border rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-black"
            rows={4}
          />
        </div>

        <button
          type="button"
          disabled={!content.trim()}
          onClick={() => {
            if (!content.trim()) return;

            addPost(content.trim());
            setContent("");
            closeModal();
          }}
          className={`px-4 py-2 rounded-lg transition ${
            content.trim()
              ? "bg-black text-white hover:opacity-90"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Post
        </button>
      </div>
    </div>
  );
}
