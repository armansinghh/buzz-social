import { useEffect } from "react";
import { useUI } from "@/features/ui/UIContext";

export default function CreatePostModal() {
  const { isCreatePostOpen, closeCreatePost } = useUI();

  // Close on Escape
  useEffect(() => {
    if (!isCreatePostOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCreatePost();
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isCreatePostOpen, closeCreatePost]);

  // Lock body scroll
  useEffect(() => {
    if (isCreatePostOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isCreatePostOpen]);

  if (!isCreatePostOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={closeCreatePost}
    >
      <div
        className="bg-white w-full max-w-lg rounded-xl p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Create Post</h2>
          <button
            onClick={closeCreatePost}
            className="text-gray-500 hover:text-black"
          >
            ✕
          </button>
        </div>

        <textarea
          placeholder="What's happening?"
          className="w-full border rounded-lg p-3 mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-black"
          rows={4}
        />

        <button className="bg-black text-white px-4 py-2 rounded-lg hover:opacity-90">
          Post
        </button>
      </div>
    </div>
  );
}