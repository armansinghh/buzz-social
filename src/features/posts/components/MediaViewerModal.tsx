import { useEffect } from "react";
import { FaXmark } from "react-icons/fa6";

interface MediaViewerModalProps {
  isOpen: boolean;
  media: { url: string; type: "image" | "video" } | null;
  onClose: () => void;
}

export default function MediaViewerModal({
  isOpen,
  media,
  onClose,
}: MediaViewerModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !media) return null;

  return (
    <div
      className="fixed inset-0 z-100 w-screen h-screen flex items-center justify-center overflow-hidden bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Absolute Close Button on Top Right */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-110 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
        aria-label="Close viewer"
      >
        <FaXmark className="w-5 h-5" />
      </button>

      {/* Media Wrapper */}
      <div
        className="max-w-5xl w-full px-4 relative flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {media.type === "image" ? (
          <img
            src={media.url}
            alt="Full media"
            className="w-full max-h-[85vh] sm:max-h-[90vh] object-contain select-none"
          />
        ) : (
          <video
            src={media.url}
            controls
            autoPlay
            className="w-full max-h-[85vh] sm:max-h-[90vh] object-contain"
          />
        )}
      </div>
    </div>
  );
}