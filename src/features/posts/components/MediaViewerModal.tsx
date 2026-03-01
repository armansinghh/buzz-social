import { useEffect } from "react";

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
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="max-w-5xl w-full px-4"
        onClick={(e) => e.stopPropagation()}
      >
        {media.type === "image" ? (
          <img
            src={media.url}
            alt="Full media"
            className="w-full max-h-[90vh] object-contain"
          />
        ) : (
          <video
            src={media.url}
            controls
            autoPlay
            className="w-full max-h-[90vh] object-contain"
          />
        )}
      </div>
    </div>
  );
}