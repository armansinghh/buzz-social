import { createContext, useContext, useState, useCallback } from "react";
import type { Post } from "./posts.types";

interface PostContextType {
  posts: Post[];
  addPost: (content: string) => void;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider = ({ children }: { children: React.ReactNode }) => {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: "1",
      author: "Arman",
      content: "Welcome to Buzz 🚀",
      createdAt: new Date().toISOString(),
      likes: 99999999999,
    },
  ]);

  const addPost = useCallback((content: string) => {
    const newPost: Post = {
      id: crypto.randomUUID(),
      author: "CurrentUser", // temporary
      content,
      createdAt: new Date().toISOString(),
      likes: 0,
    };

    setPosts((prev) => [newPost, ...prev]);
  }, []);

  return (
    <PostContext.Provider value={{ posts, addPost }}>
      {children}
    </PostContext.Provider>
  );
};

export const usePosts = () => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error("usePosts must be used within PostProvider");
  }
  return context;
};