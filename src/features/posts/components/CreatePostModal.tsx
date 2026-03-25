import { useEffect, useState, useRef } from "react";
import { useUI } from "@/features/ui/UIContext";
import { usePosts } from "@/features/posts/PostContext";

export default function CreatePostModal() {
  const { activeModal, closeModal } = useUI();
  const isOpen = activeModal === "createPost";
  const { addPost } = usePosts();

  const [caption, setCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleClose = () => {
    setCaption("");
    setSelectedFile(null);
    setPreview(null);
    closeModal();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreview(null);
  };

  if (!isOpen) return null;

  const canPost = caption.trim() || selectedFile;

  const handlePost = () => {
    if (!canPost) return;
    let media: { url: string; type: "image" | "video" } | undefined;
    if (selectedFile && preview) {
      media = {
        url: preview,
        type: selectedFile.type.startsWith("video") ? "video" : "image",
      };
    }
    addPost(caption.trim(), media);
    handleClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="bg-[var(--bg-primary)] w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl overflow-hidden modal-in border border-[var(--border-color)]"
        style={{ boxShadow: "var(--shadow-md)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-color)]">
          <button
            onClick={handleClose}
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Cancel
          </button>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Create post</h2>
          <button
            onClick={handlePost}
            disabled={!canPost}
            className={`text-sm font-semibold transition-opacity
              ${canPost ? "text-blue-500 hover:text-blue-400" : "text-[var(--text-muted)] cursor-not-allowed opacity-50"}`}
          >
            Share
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          {/* Caption */}
          <textarea
            ref={textareaRef}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="What's buzzing?"
            className="w-full resize-none outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-transparent text-base leading-relaxed"
            rows={4}
          />

          {/* File preview */}
          {preview && (
            <div className="relative mt-3 rounded-xl overflow-hidden bg-[var(--bg-tertiary)]">
              {selectedFile?.type.startsWith("video") ? (
                <video src={preview} controls className="w-full max-h-64 object-contain" />
              ) : (
                <img src={preview} alt="Preview" className="w-full max-h-64 object-contain" />
              )}
              <button
                onClick={removeFile}
                className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full text-white flex items-center justify-center text-xs hover:bg-black/80 transition-colors"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--border-color)]">
          <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span>Photo / Video</span>
            <input type="file" accept="image/*,video/*" onChange={handleFileChange} className="sr-only" />
          </label>

          <span className={`text-xs font-medium transition-colors ${caption.length > 2000 ? "text-red-500" : "text-[var(--text-muted)]"}`}>
            {caption.length} / 2200
          </span>
        </div>
      </div>
    </div>
  );
}