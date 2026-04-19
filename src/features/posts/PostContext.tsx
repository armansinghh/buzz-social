import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
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
  limit,
  startAfter,
} from "firebase/firestore";

import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

import { db } from "@/lib/firebase";

import { useNotifications } from "@/features/notifications/NotificationContext";
import type { Post } from "@/types/post";
import { useAuth } from "@/features/auth/AuthContext";
import { buildPost, buildComment } from "@/services/postBuilder";
import { mapPost } from "@/services/postMapper";

interface Media {
  url: string;
  type: "image" | "video";
}

interface PostContextType {
  posts: Post[];
  hasMore: boolean;

  loadMorePosts: () => Promise<void>;

  addPost: (caption: string, media?: Media) => Promise<void>;

  toggleLike: (postId: string) => void;
  likePost: (postId: string) => void;
  addComment: (postId: string, text: string) => void;
  toggleReaction: (postId: string, commentId: string, emoji: string) => void;
}

const POSTS_PER_PAGE = 10;

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, profile } = useAuth();
  const { createNotification } = useNotifications();
  const [posts, setPosts] = useState<Post[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);

  // Guard against concurrent loadMorePosts calls (double-click / fast scroll)
  const loadingMoreRef = useRef(false);

  useEffect(() => {
    const fetchInitialPosts = async () => {
      try {
        const q = query(
          collection(db, "posts"),
          orderBy("createdAt", "desc"),
          limit(POSTS_PER_PAGE),
        );

        const snapshot = await getDocs(q);

        // Always go through mapPost — never spread doc.data() directly
        const fetchedPosts = snapshot.docs.map((docSnap) =>
          mapPost(docSnap.id, docSnap.data()),
        );

        setPosts(fetchedPosts);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1] ?? null);
        setHasMore(snapshot.docs.length === POSTS_PER_PAGE);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      }
    };

    fetchInitialPosts();
  }, []);

  const loadMorePosts = useCallback(async () => {
    if (!lastDoc || !hasMore || loadingMoreRef.current) return;

    loadingMoreRef.current = true;
    try {
      const q = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc"),
        startAfter(lastDoc),
        limit(POSTS_PER_PAGE),
      );

      const snapshot = await getDocs(q);

      // Always go through mapPost — never spread doc.data() directly
      const newPosts = snapshot.docs.map((docSnap) =>
        mapPost(docSnap.id, docSnap.data()),
      );

      setPosts((prev) => [...prev, ...newPosts]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] ?? null);
      setHasMore(snapshot.docs.length === POSTS_PER_PAGE);
    } catch (err) {
      console.error("Failed loading more posts:", err);
    } finally {
      loadingMoreRef.current = false;
    }
  }, [lastDoc, hasMore]);

  const addPost = async (caption: string, media?: Media) => {
    if (!user) return;

    try {
      const newPost = buildPost({
        user,
        profile,
        caption,
        media,
      });

      const docRef = await addDoc(collection(db, "posts"), newPost);

      // Attach the Firestore-generated id explicitly — never rely on spread order
      setPosts((prev) => [{ ...newPost, id: docRef.id }, ...prev]);
    } catch (err) {
      console.error("Failed to add post:", err);
    }
  };

  const toggleLike = useCallback(
    async (postId: string) => {
      if (!user) return;

      const userId = user.uid;

      // Use functional updater to read current state — avoids stale closure
      let wasLiked = false;
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== postId) return post;
          wasLiked = post.likes.includes(userId);
          return {
            ...post,
            likes: wasLiked
              ? post.likes.filter((id) => id !== userId)
              : [...post.likes, userId],
          };
        }),
      );

      try {
        const postRef = doc(db, "posts", postId);
        await updateDoc(postRef, {
          likes: wasLiked ? arrayRemove(userId) : arrayUnion(userId),
        });
      } catch (err) {
        console.error("Failed to toggle like:", err);
        // Roll back optimistic update on failure
        setPosts((prev) =>
          prev.map((post) => {
            if (post.id !== postId) return post;
            return {
              ...post,
              likes: wasLiked
                ? [...post.likes, userId]
                : post.likes.filter((id) => id !== userId),
            };
          }),
        );
      }
    },
    [user],
  );

  // likePost only adds a like — it never removes (used for double-tap gesture)
  const likePost = useCallback(
    async (postId: string) => {
      if (!user) return;

      const userId = user.uid;

      // Check current state before optimistic update
      setPosts((prev) => {
        const target = prev.find((p) => p.id === postId);
        if (!target || target.likes.includes(userId)) return prev; // already liked, no-op
        return prev.map((post) =>
          post.id !== postId
            ? post
            : { ...post, likes: [...post.likes, userId] },
        );
      });

      // Fire-and-forget Firestore write — arrayUnion is idempotent so safe
      const postRef = doc(db, "posts", postId);
      try {
        await updateDoc(postRef, { likes: arrayUnion(userId) });
      } catch (err) {
        console.error("Failed to like post:", err);
      }
    },
    [user],
  );

  const addComment = useCallback(
    async (postId: string, text: string) => {
      if (!user) return;

      let authorId = "";
      let updatedComments: Post["comments"] = [];

      setPosts((prev) => {
        const target = prev.find((p) => p.id === postId);
        if (!target) return prev;

        authorId = target.authorId;

        const newComment = buildComment({ user, profile, text });
        updatedComments = [...target.comments, newComment];

        return prev.map((post) =>
          post.id !== postId ? post : { ...post, comments: updatedComments },
        );
      });

      try {
        const postRef = doc(db, "posts", postId);
        await updateDoc(postRef, { comments: updatedComments });

        if (authorId && authorId !== user.uid) {
          await createNotification({
            recipientId: authorId,
            senderId: user.uid,
            senderName: profile?.username || user.displayName || "User",
            senderAvatar: profile?.avatar || user.photoURL || "",
            type: "comment",
            postId,
          });
        }
      } catch (err) {
        console.error("Failed to add comment:", err);
      }
    },
    [user, profile, createNotification],
  );

  const toggleReaction = useCallback(
    async (postId: string, commentId: string, emoji: string) => {
      if (!user) return;

      const userId = user.uid;
      let updatedComments: Post["comments"] = [];

      setPosts((prev) => {
        const target = prev.find((p) => p.id === postId);
        if (!target) return prev;

        updatedComments = target.comments.map((comment) => {
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
            reactions: [...comment.reactions, { emoji, users: [userId] }],
          };
        });

        return prev.map((post) =>
          post.id !== postId ? post : { ...post, comments: updatedComments },
        );
      });

      try {
        const postRef = doc(db, "posts", postId);
        await updateDoc(postRef, { comments: updatedComments });
      } catch (err) {
        console.error("Failed to toggle reaction:", err);
      }
    },
    [user],
  );

  return (
    <PostContext.Provider
      value={{
        posts,
        hasMore,
        loadMorePosts,
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
