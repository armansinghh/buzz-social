import { useState, useRef, useEffect } from "react";
import type { Comment } from "@/features/posts/posts.types";
import { formatRelativeTime } from "@/utils/formatRelativeTime";
import { usePosts } from "@/features/posts/PostContext";
import { useAuth } from "@/features/auth/useAuth";
import EmojiPicker from "emoji-picker-react";

interface CommentItemProps {
  comment: Comment;
  postId: string;
}

interface PickerPosition {
  x: number;
  y: number;
}

export default function CommentItem({ comment, postId }: CommentItemProps) {
  const { toggleReaction } = usePosts();
  const { user } = useAuth();

  const [showPicker, setShowPicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState<PickerPosition | null>(
    null,
  );

  const pickerRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const userId = user?.id ?? "guest";

  // Open picker anchored to button
  const openPicker = () => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();

    const pickerHeight = 360;

    let y = rect.top - pickerHeight - 8;
    let x = rect.left;

    // If not enough space above → open below
    if (y < 8) {
      y = rect.bottom + 8;
    }

    // Prevent touching right edge
    const maxX = window.innerWidth - 320;
    if (x > maxX) x = maxX;

    setPickerPosition({ x, y });
    setShowPicker(true);
  };

  // lock scroll
  useEffect(() => {
    if (showPicker) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [showPicker]);

  // close picker outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target as Node) &&
        !buttonRef.current?.contains(e.target as Node)
      ) {
        setShowPicker(false);
      }
    }

    if (showPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPicker]);
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      window.addEventListener("keydown", handleEsc);
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [showPicker]);
  return (
    <div className="text-sm">
      {/* Comment content */}
      <div className="flex justify-between">
        <div>
          <span className="font-semibold mr-2">{comment.authorId}</span>
          <span className="text-gray-800">{comment.text}</span>

          <div className="text-xs text-gray-400 mt-1">
            {formatRelativeTime(comment.createdAt)}
          </div>
        </div>
      </div>

      {/* Reactions */}
      <div className="flex items-center gap-2 mt-1 flex-wrap">
        {comment.reactions.map((reaction) => {
          const reactedByUser = reaction.users.includes(userId);

          return (
            <button
              key={reaction.emoji}
              onClick={() => toggleReaction(postId, comment.id, reaction.emoji)}
              className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full transition
              ${
                reactedByUser
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <span>{reaction.emoji}</span>
              <span>{reaction.users.length}</span>
            </button>
          );
        })}

        {/* Add reaction button */}
        <button
          ref={buttonRef}
          onClick={() => {
            if (showPicker) {
              setShowPicker(false);
            } else {
              openPicker();
            }
          }}
          className="text-xs bg-gray-100 px-2 py-0.5 rounded-full hover:bg-gray-200 transition"
        >
          +
        </button>
      </div>

      {/* Floating Emoji Picker */}
      {showPicker && pickerPosition && (
        <div
          ref={pickerRef}
          style={{
            position: "fixed",
            left: pickerPosition.x,
            top: pickerPosition.y,
            zIndex: 1000,
          }}
        >
          <EmojiPicker
            onEmojiClick={(emojiData) => {
              toggleReaction(postId, comment.id, emojiData.emoji);
              setShowPicker(false);
            }}
            previewConfig={{ showPreview: false }}
          />
        </div>
      )}
    </div>
  );
}
