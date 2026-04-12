import { createContext, useContext, useState, useCallback } from "react";
import type { Post, Comment } from "./posts.types";
import { useAuth } from "@/features/auth/AuthContext";

interface Media {
  url: string;
  type: "image" | "video";
}

interface PostContextType {
  posts: Post[];
  addPost: (caption: string, media?: Media) => void;
  toggleLike: (postId: string) => void;
  likePost: (postId: string) => void;
  addComment: (postId: string, text: string) => void;
  toggleReaction: (postId: string, commentId: string, emoji: string) => void;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, profile } = useAuth();

  const [posts, setPosts] = useState<Post[]>([
    {
      id: "1",
      authorId: "demo-user",
      caption: "Welcome to Buzz 🚀",
      media: undefined,
      likes: ["demo-user", "riya", "alex", "john"],
      comments: [
        {
          id: "c1",
          authorId: "riya",
          text: "This looks cool!",
          reactions: [
            { emoji: "🔥", users: ["riya"] },
            { emoji: "😂", users: ["demo-user"] },
          ],
          createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
        },
      ],
      createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    },
  ]);

  // 🔹 Add Post
  const addPost = useCallback(
    (caption: string, media?: Media) => {
      if (!user || !profile) return;

      const newPost: Post = {
        id: crypto.randomUUID(),
        authorId: profile.username ?? user.uid,
        caption,
        media,
        likes: [],
        comments: [],
        createdAt: new Date().toISOString(),
      };

      setPosts((prev) => [newPost, ...prev]);
    },
    [user, profile]
  );

  // 🔹 Toggle Like
  const toggleLike = useCallback(
    (postId: string) => {
      if (!user) return;
      const userId = user.uid;

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
        })
      );
    },
    [user]
  );

  // 🔹 Like (one-way)
  const likePost = useCallback(
    (postId: string) => {
      if (!user) return;
      const userId = user.uid;

      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id !== postId) return post;

          if (post.likes.includes(userId)) return post;

          return {
            ...post,
            likes: [...post.likes, userId],
          };
        })
      );
    },
    [user]
  );

  // 🔹 Add Comment
  const addComment = useCallback(
    (postId: string, text: string) => {
      if (!user || !profile) return;

      const newComment: Comment = {
        id: crypto.randomUUID(),
        authorId: profile.username ?? user.uid,
        text,
        reactions: [],
        createdAt: new Date().toISOString(),
      };

      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id !== postId) return post;

          return {
            ...post,
            comments: [...post.comments, newComment],
          };
        })
      );
    },
    [user, profile]
  );

  // 🔹 Toggle Reaction
  const toggleReaction = useCallback(
    (postId: string, commentId: string, emoji: string) => {
      if (!user) return;
      const userId = user.uid;

      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id !== postId) return post;

          return {
            ...post,
            comments: post.comments.map((comment) => {
              if (comment.id !== commentId) return comment;

              const reactionIndex = comment.reactions.findIndex(
                (r) => r.emoji === emoji
              );

              if (reactionIndex !== -1) {
                const reaction = comment.reactions[reactionIndex];
                const hasReacted = reaction.users.includes(userId);

                const updatedUsers = hasReacted
                  ? reaction.users.filter((u) => u !== userId)
                  : [...reaction.users, userId];

                if (updatedUsers.length === 0) {
                  return {
                    ...comment,
                    reactions: comment.reactions.filter(
                      (r) => r.emoji !== emoji
                    ),
                  };
                }

                return {
                  ...comment,
                  reactions: comment.reactions.map((r) =>
                    r.emoji === emoji ? { ...r, users: updatedUsers } : r
                  ),
                };
              }

              return {
                ...comment,
                reactions: [
                  ...comment.reactions,
                  { emoji, users: [userId] },
                ],
              };
            }),
          };
        })
      );
    },
    [user]
  );

  return (
    <PostContext.Provider
      value={{
        posts,
        addPost,
        toggleLike,
        likePost,
        addComment,
        toggleReaction,
      }}
    >
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