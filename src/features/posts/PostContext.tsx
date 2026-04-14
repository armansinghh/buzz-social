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

        const fetchedPosts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Post[];

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
        media: media || undefined,
        likes: [],
        comments: [],
        createdAt: new Date().toISOString(),
      };
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

  const toggleLike = useCallback((postId: string) => {}, []);

  const likePost = useCallback((postId: string) => {}, []);

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
