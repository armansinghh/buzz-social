import { createContext, useContext, useState, useCallback } from "react";
import type { Post } from "./posts.types";
import { useAuth } from "@/features/auth/useAuth";

interface PostContextType {
  posts: Post[];
  addPost: (caption: string, mediaUrl?: string) => void;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  const [posts, setPosts] = useState<Post[]>([
    {
      id: "1",
      authorId: "demo-user",
      caption: "Welcome to Buzz 🚀",
      mediaUrl: undefined,
      likes: [],
      createdAt: new Date().toISOString(),
    },
  ]);
  
  const addPost = useCallback(
    (caption: string, mediaUrl?: string) => {
      const authorId = user?.id ?? "guest";

      const newPost: Post = {
        id: crypto.randomUUID(),
        authorId,
        caption,
        mediaUrl,
        likes: [],
        createdAt: new Date().toISOString(),
      };

      setPosts((prev) => [newPost, ...prev]);
    },
    [user],
  );

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
