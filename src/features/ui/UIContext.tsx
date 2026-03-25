import { createContext, useContext, useEffect, useState } from "react";

export type ActiveModal =
  | "createPost"
  | "notifications"
  | "comments"
  | null;

export type Theme = "light" | "dark";

interface EmojiPickerState {
  commentId: string;
  postId: string;
  position: { x: number; y: number };
}

interface UIContextType {
  activeModal: ActiveModal;
  commentsPostId: string | null;

  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;

  // ✅ Emoji Picker
  emojiPicker: EmojiPickerState | null;
  openEmojiPicker: (
    commentId: string,
    postId: string,
    position: { x: number; y: number }
  ) => void;
  closeEmojiPicker: () => void;

  openModal: (modal: ActiveModal) => void;
  closeModal: () => void;

  openComments: (postId: string) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [commentsPostId, setCommentsPostId] = useState<string | null>(null);

  const [theme, setThemeState] = useState<Theme>("light");

  // ✅ Emoji Picker state
  const [emojiPicker, setEmojiPicker] = useState<EmojiPickerState | null>(null);

  const openEmojiPicker = (
    commentId: string,
    postId: string,
    position: { x: number; y: number }
  ) => {
    setEmojiPicker({ commentId, postId, position });
  };

  const closeEmojiPicker = () => {
    setEmojiPicker(null);
  };

  // Apply theme
  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  const setTheme = (theme: Theme) => {
    setThemeState(theme);
    localStorage.setItem("buzz-theme", theme);
    applyTheme(theme);
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("buzz-theme") as Theme | null;

    if (savedTheme) {
      setThemeState(savedTheme);
      applyTheme(savedTheme);
      return;
    }

    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    const defaultTheme: Theme = systemPrefersDark ? "dark" : "light";

    setThemeState(defaultTheme);
    applyTheme(defaultTheme);
  }, []);

  const openModal = (modal: ActiveModal) => {
    setActiveModal(modal);
  };

  const openComments = (postId: string) => {
    setCommentsPostId(postId);
    setActiveModal("comments");
  };

  const closeModal = () => {
    setActiveModal(null);
    setCommentsPostId(null);
  };

  return (
    <UIContext.Provider
      value={{
        activeModal,
        commentsPostId,
        theme,
        toggleTheme,
        setTheme,
        emojiPicker,
        openEmojiPicker,
        closeEmojiPicker,
        openModal,
        openComments,
        closeModal,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI must be used within UIProvider");
  }
  return context;
};