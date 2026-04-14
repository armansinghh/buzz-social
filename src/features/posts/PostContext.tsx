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

        const fetchedPosts = snapshot.docs.map((docSnap) => ({
          ...(docSnap.data() as Omit<Post, "id">),
          id: docSnap.id,
        }));

        setPosts(fetchedPosts);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      }
    };

    fetchPosts();
  }, []);

  // ADD POST
  const addPost = useCallback(
    async (caption: string, media?: Media) => {
      if (!user || !profile) return;

      const newPost: Post = {
        id: "",
        authorId: user.uid,
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

  const addComment = useCallback((postId: string, text: string) => {}, []);

  const toggleReaction = useCallback(
    (postId: string, commentId: string, emoji: string) => {},
    [],
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
