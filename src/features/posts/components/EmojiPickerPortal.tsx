import { useEffect, useRef, useState } from "react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { useUI } from "@/contexts/UIContext";
import { usePosts } from "@/features/posts/PostContext";

export default function EmojiPickerPortal() {
  const { emojiPicker, closeEmojiPicker } = useUI();
  const { toggleReaction } = usePosts();

  const pickerRef = useRef<HTMLDivElement | null>(null);
  const [theme, setTheme] = useState<Theme>(Theme.LIGHT);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");

    setTheme(isDark ? Theme.DARK : Theme.LIGHT);
  }, [emojiPicker]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target as Node)
      ) {
        closeEmojiPicker();
      }
    }

    if (emojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [emojiPicker]);

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeEmojiPicker();
    };

    if (emojiPicker) {
      window.addEventListener("keydown", handleEsc);
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [emojiPicker]);

  if (!emojiPicker) return null;

  return (
    <div
      ref={pickerRef}
      style={{
        position: "fixed",
        top: emojiPicker.position.y,
        left: emojiPicker.position.x,
        zIndex: 1000,
      }}
    >
      <EmojiPicker
        theme={theme}
        onEmojiClick={(emojiData) => {
          toggleReaction(
            emojiPicker.postId,
            emojiPicker.commentId,
            emojiData.emoji
          );
          closeEmojiPicker();
        }}
        previewConfig={{ showPreview: false }}
      />
    </div>
  );
}