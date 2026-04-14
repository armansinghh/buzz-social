import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

import {
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import type { Post, Comment } from "./posts.types";
import { useAuth } from "@/features/auth/AuthContext";

interface Media {
  url: string;
  type: "image" | "video";
}

interface PostContextType {
  posts: Post[];
  addPost: (caption: string, media?: Media) => Promise<void>;

  toggleLike: (postId: string) => void;
  likePost: (postId: string) => void;
  addComment: (postId: string, text: string) => void;
  toggleReaction: (postId: string, commentId: string, emoji: string) => void;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, profile } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);

  // FETCH POSTS
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

        const snapshot = await getDocs(q);

        const fetchedPosts = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as Omit<Post, "id">;

          return {
            ...data,
            id: docSnap.id,
            authorName: data.authorName || "User",
            authorPhoto: data.authorPhoto || undefined,
          };
        });

        setPosts(fetchedPosts);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      }
    };

    fetchPosts();
  }, []);

  // ADD POST — fixed: don't gate on profile, fall back gracefully
  const addPost = useCallback(
    async (caption: string, media?: Media) => {
      if (!user) {
        console.warn("addPost: no user");
        return;
      }

      // Build display name from whatever is available
      const authorName =
        profile?.name ||
        profile?.username ||
        user.displayName ||
        "User";

      // Support both photoURL (Google) and avatar (custom upload)
      const authorPhoto =
        profile?.photoURL ||
        profile?.avatar ||
        user.photoURL ||
        undefined;

      const newPost: Omit<Post, "id"> = {
        authorId: user.uid,
        authorName,
        authorPhoto: authorPhoto ?? undefined,
        caption,
        likes: [],
        comments: [],
        createdAt: new Date().toISOString(),
      };

      if (media) {
        newPost.media = media;
      }

      try {
        const docRef = await addDoc(collection(db, "posts"), newPost);

        setPosts((prev) => [
          {
            ...newPost,
            id: docRef.id,
          },
          ...prev,
        ]);
      } catch (err) {
        console.error("Failed to save post:", err);
        throw err; // re-throw so CreatePostModal can catch it
      }
    },
    [user, profile],
  );

  const toggleLike = useCallback(
    async (postId: string) => {
      if (!user) return;

      const userId = user.uid;
      const targetPost = posts.find((post) => post.id === postId);
      if (!targetPost) return;

      const postRef = doc(db, "posts", postId);
      const isLiked = targetPost.likes.includes(userId);

      try {
        await updateDoc(postRef, {
          likes: isLiked ? arrayRemove(userId) : arrayUnion(userId),
        });

        setPosts((prev) =>
          prev.map((post) => {
            if (post.id !== postId) return post;
            return {
              ...post,
              likes: isLiked
                ? post.likes.filter((id) => id !== userId)
                : [...post.likes, userId],
            };
          }),
        );
      } catch (err) {
        console.error("Failed to toggle like:", err);
      }
    },
    [user, posts],
  );

  const likePost = useCallback(
    async (postId: string) => {
      if (!user) return;

      const userId = user.uid;
      const targetPost = posts.find((post) => post.id === postId);
      if (!targetPost) return;
      if (targetPost.likes.includes(userId)) return;

      const postRef = doc(db, "posts", postId);

      try {
        await updateDoc(postRef, {
          likes: arrayUnion(userId),
        });

        setPosts((prev) =>
          prev.map((post) => {
            if (post.id !== postId) return post;
            return {
              ...post,
              likes: [...post.likes, userId],
            };
          }),
        );
      } catch (err) {
        console.error("Failed to like post:", err);
      }
    },
    [user, posts],
  );

  const addComment = useCallback(
    async (postId: string, text: string) => {
      if (!user) return;

      const targetPost = posts.find((post) => post.id === postId);
      if (!targetPost) return;

      const newComment: Comment = {
        id: crypto.randomUUID(),
        authorId: profile?.username ?? user.uid,
        text,
        reactions: [],
        createdAt: new Date().toISOString(),
      };

      const updatedComments = [...targetPost.comments, newComment];

      try {
        const postRef = doc(db, "posts", postId);
        await updateDoc(postRef, { comments: updatedComments });

        setPosts((prev) =>
          prev.map((post) => {
            if (post.id !== postId) return post;
            return { ...post, comments: updatedComments };
          }),
        );
      } catch (err) {
        console.error("Failed to add comment:", err);
      }
    },
    [user, profile, posts],
  );

  const toggleReaction = useCallback(
    async (postId: string, commentId: string, emoji: string) => {
      if (!user) return;

      const userId = user.uid;
      const targetPost = posts.find((post) => post.id === postId);
      if (!targetPost) return;

      const updatedComments = targetPost.comments.map((comment) => {
        if (comment.id !== commentId) return comment;

        const reactionIndex = comment.reactions.findIndex(
          (r) => r.emoji === emoji,
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
              reactions: comment.reactions.filter((r) => r.emoji !== emoji),
            };
          }

          return {
            ...comment,
            reactions: comment.reactions.map((r) =>
              r.emoji === emoji ? { ...r, users: updatedUsers } : r,
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
      });

      try {
        const postRef = doc(db, "posts", postId);
        await updateDoc(postRef, { comments: updatedComments });

        setPosts((prev) =>
          prev.map((post) => {
            if (post.id !== postId) return post;
            return { ...post, comments: updatedComments };
          }),
        );
      } catch (err) {
        console.error("Failed to toggle reaction:", err);
      }
    },
    [user, posts],
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