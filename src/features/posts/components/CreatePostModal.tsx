import { useEffect, useState, useRef } from "react";
import { useUI } from "@/features/ui/UIContext";
import { usePosts } from "@/features/posts/PostContext";

export default function CreatePostModal() {
  const { activeModal, closeModal } = useUI();
  const isOpen = activeModal === "createPost";
  const { addPost } = usePosts();

  const [caption, setCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Escape key handling
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, closeModal]);

  // Focus + scroll lock
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const canPost = caption.trim() || selectedFile;

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

        {/* Caption */}
        <div className="mb-4">
          <label htmlFor="create-post-caption" className="sr-only">
            Post Caption
          </label>

          <textarea
            ref={textareaRef}
            id="create-post-caption"
            name="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption..."
            className="w-full border rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-black"
            rows={4}
          />
        </div>

        {/* Media Input */}
        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setSelectedFile(file);
          }}
          className="mb-4"
        />

        {/* Footer */}
        <div className="flex items-center justify-between mt-3">
          <div className="text-sm text-gray-500">
            {caption.length} characters
          </div>

          <button
            type="button"
            disabled={!canPost}
            onClick={() => {
              if (!canPost) return;

              let media;

              if (selectedFile) {
                media = {
                  url: URL.createObjectURL(selectedFile),
                  type: selectedFile.type.startsWith("video")
                    ? "video"
                    : "image",
                };
              }

              addPost(caption.trim(), media);

              setCaption("");
              setSelectedFile(null);
              closeModal();
            }}
            className={`px-4 py-2 rounded-lg transition ${
              canPost
                ? "bg-black text-white hover:opacity-90"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}