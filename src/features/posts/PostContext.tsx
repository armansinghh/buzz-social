import { createContext, useContext, useState, useCallback } from "react";
import type { Post, Comment } from "./posts.types";
import { useAuth } from "@/features/auth/useAuth";

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
  const { user } = useAuth();

  const [posts, setPosts] = useState<Post[]>([
    {
      id: "1",
      authorId: "demo-user",
      caption: "Welcome to Buzz 🚀",
      media: undefined,
      likes: ["guest", "riya", "alex", "john"],
      comments: [
        {
          id: "c1",
          authorId: "riya",
          text: "This looks cool!",
          reactions: [
            {
              emoji: "🔥",
              users: ["guest", "riya"],
            },
            {
              emoji: "😂",
              users: ["demo-user"],
            },
          ],
          createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
        },
        {
          id: "c2",
          authorId: "john",
          text: "Waiting for more features 👀",
          reactions: [
            {
              emoji: "👀",
              users: ["guest"],
            },
          ],
          createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        },
        {
          id: "c3",
          authorId: "alex",
          text: "Nice UI!",
          reactions: [],
          createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
        },
        {
          id: "c4",
          authorId: "Pal",
          text: "no way this is built in 2 weeks",
          reactions: [
            {
              emoji: "🤣",
              users: ["riya", "alex"],
            },
          ],
          createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
        },
      ],
      createdAt:  new Date(Date.now() - 1000 * 60 * 40).toISOString(),
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
        comments: [],
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

  const likePost = useCallback(
    (postId: string) => {
      const userId = user?.id ?? "guest";

      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id !== postId) return post;

          if (post.likes.includes(userId)) return post;

          return {
            ...post,
            likes: [...post.likes, userId],
          };
        }),
      );
    },
    [user],
  );

  const addComment = useCallback(
    (postId: string, text: string) => {
      const authorId = user?.id ?? "guest";

      const newComment: Comment = {
        id: crypto.randomUUID(),
        authorId,
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
        }),
      );
    },
    [user],
  );

  const toggleReaction = useCallback(
    (postId: string, commentId: string, emoji: string) => {
      const userId = user?.id ?? "guest";

      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id !== postId) return post;

          return {
            ...post,
            comments: post.comments.map((comment) => {
              if (comment.id !== commentId) return comment;

              const reactionIndex = comment.reactions.findIndex(
                (r) => r.emoji === emoji,
              );

              // Reaction already exists
              if (reactionIndex !== -1) {
                const reaction = comment.reactions[reactionIndex];
                const hasReacted = reaction.users.includes(userId);

                let updatedUsers;

                if (hasReacted) {
                  updatedUsers = reaction.users.filter((u) => u !== userId);
                } else {
                  updatedUsers = [...reaction.users, userId];
                }

                // Remove reaction if no users left
                if (updatedUsers.length === 0) {
                  return {
                    ...comment,
                    reactions: comment.reactions.filter(
                      (r) => r.emoji !== emoji,
                    ),
                  };
                }

                return {
                  ...comment,
                  reactions: comment.reactions.map((r) =>
                    r.emoji === emoji ? { ...r, users: updatedUsers } : r,
                  ),
                };
              }

              // Reaction doesn't exist yet
              return {
                ...comment,
                reactions: [...comment.reactions, { emoji, users: [userId] }],
              };
            }),
          };
        }),
      );
    },
    [user],
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
