import { createContext, useContext, useState, useCallback } from "react";
import type { Post } from "./posts.types";
import { useAuth } from "@/features/auth/useAuth";

interface Media {
  url: string;
  type: "image" | "video";
}

interface PostContextType {
  posts: Post[];
  addPost: (caption: string, media?: Media) => void;
  toggleLike: (postId: string) => void;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  const [posts, setPosts] = useState<Post[]>([
    {
      id: "1",
      authorId: "demo-user",
      caption: "Welcome to Buzz 🚀",
      media: undefined,
      likes: [],
      createdAt: new Date().toISOString(),
    },
  ]);

  const addPost = useCallback(
    (caption: string, media?: Media) => {
      const authorId = user?.id ?? "guest";

      const newPost: Post = {
        id: crypto.randomUUID(),
        authorId,
        caption,
        media,
        likes: [],
        createdAt: new Date().toISOString(),
      };

      setPosts((prev) => [newPost, ...prev]);
    },
    [user],
  );

  const toggleLike = useCallback(
    (postId: string) => {
      const userId = user?.id ?? "guest";

      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id !== postId) return post;

          const isLiked = post.likes.includes(userId);

          return {
            ...post,
            likes: isLiked
              ? post.likes.filter((id) => id !== userId)
              : [...post.likes, userId],
          };
        }),
      );
    },
    [user],
  );

  return (
    <PostContext.Provider value={{ posts, addPost, toggleLike }}>
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
