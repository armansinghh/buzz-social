import { createContext, useContext, useState } from "react";

export type ActiveModal =
  | "createPost"
  | "notifications"
  | "comments"
  | null;

interface UIContextType {
  activeModal: ActiveModal;
  commentsPostId: string | null;

  openModal: (modal: ActiveModal) => void;
  closeModal: () => void;

  openComments: (postId: string) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [commentsPostId, setCommentsPostId] = useState<string | null>(null);

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