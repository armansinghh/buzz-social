import { createContext, useContext, useState } from "react";

interface UIContextType {
  isCreatePostOpen: boolean;
  openCreatePost: () => void;
  closeCreatePost: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider = ({ children }: { children: React.ReactNode }) => {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  const openCreatePost = () => setIsCreatePostOpen(true);
  const closeCreatePost = () => setIsCreatePostOpen(false);

  return (
    <UIContext.Provider
      value={{ isCreatePostOpen, openCreatePost, closeCreatePost }}
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
console.log("UIProvider mounted");