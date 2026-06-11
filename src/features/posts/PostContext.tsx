"use client"

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
  deleteDoc,
} from "firebase/firestore";

import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

import { db } from "@/lib/firebase";

import { useNotifications } from "@/features/notifications/NotificationContext";
import type { Post } from "@/types/post";
import { useAuth } from "@/features/auth/AuthContext";
import { buildPost, buildComment } from "@/services/postBuilder";
import { mapPost } from "@/services/postMapper";
import { useToast } from "@/contexts/ToastContext";

interface Media {
  url: string;
  type: "image" | "video";
}

interface PostContextType {
  posts: Post[];
  postsLoading: boolean;
  hasMore: boolean;
  loadMorePosts: () => Promise<void>;
  addPost: (caption: string, media?: Media) => Promise<void>;
  toggleLike: (postId: string) => void;
  likePost: (postId: string) => void;
  addComment: (postId: string, text: string) => void;
  toggleReaction: (postId: string, commentId: string, emoji: string) => void;
  deletePost: (postId: string) => Promise<void>;
}

const POSTS_PER_PAGE = 10;

const PostContext = createContext<PostContextType | undefined>(undefined);

// Builds a clean object for every comment.
// Firestore will throw an error if we try to save undefined fields or complex nested instances,
// so we serialize it into a strict shape before writing.
function serializeComments(comments: Post["comments"]) {
  return comments.map((c) => ({
    id: c.id,
    authorId: c.authorId,
    text: c.text,
    reactions: c.reactions.map((r) => ({
      emoji: r.emoji,
      users: [...r.users],
    })),
    createdAt: c.createdAt,
  }));
}

export const PostProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { createNotification } = useNotifications();
  const { showToast } = useToast();

  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);

  // Guard against concurrent fetch calls, like when a user mashes the load button or scrolls too fast
  const loadingMoreRef = useRef(false);

  useEffect(() => {
    // Don't try fetching if we are still verifying the user session
    if (loading || !user) return;

    const fetchInitialPosts = async () => {
      setPostsLoading(true);
      try {
        const q = query(
          collection(db, "posts"),
          orderBy("createdAt", "desc"),
          limit(POSTS_PER_PAGE),
        );
        const snapshot = await getDocs(q);
        const fetchedPosts = snapshot.docs.map((docSnap) =>
          mapPost(docSnap.id, docSnap.data()),
        );

        setPosts(fetchedPosts);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1] ?? null);
        setHasMore(snapshot.docs.length === POSTS_PER_PAGE);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      } finally {
        setPostsLoading(false);
      }
    };

    fetchInitialPosts();
  }, [user, loading]);

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

      // Always map the post to ensure we have our default values, never trust raw doc.data() completely
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
      const newPost = buildPost({ user, caption, media });

      // We get the real ID immediately upon creation
      const docRef = await addDoc(collection(db, "posts"), newPost);

      // Optimistically update the UI so it feels instant to the user
      setPosts((prev) => [
        {
          ...newPost,
          id: docRef.id,
          // Fallback to a local timestamp just to prevent UI crashes before the next server sync happens
          createdAt: new Date().toISOString(),
        } as Post,
        ...prev,
      ]);
    } catch (err) {
      console.error("Failed to add post:", err);
    }
  };

  const toggleLike = useCallback(
    async (postId: string) => {
      if (!user) return;
      const userId = user.uid;
      let wasLiked = false;
      let authorId = "";
      let newTotal = 0; // The local math for the notification

      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== postId) return post;
          wasLiked = post.likes.includes(userId);
          authorId = post.authorId;
          newTotal = wasLiked ? post.likes.length - 1 : post.likes.length + 1;

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

        // NOTIFICATION TRIGGER: Only if ADDING a like, and not liking your own post
        if (!wasLiked && authorId && authorId !== userId) {
          await createNotification({
            recipientId: authorId,
            senderId: userId,
            type: "like",
            postId,
            totalLikes: newTotal,
          } as any);
        }
      } catch (err) {
        console.error("Failed to toggle like:", err);
        // ... (Keep your rollback state logic exactly the same if you want, or leave as is)
      }
    },
    [user, createNotification],
  );

  const likePost = useCallback(
    async (postId: string) => {
      if (!user) return;
      const userId = user.uid;
      let alreadyLiked = false;
      let authorId = "";
      let newTotal = 0;

      setPosts((prev) => {
        const target = prev.find((p) => p.id === postId);
        if (!target || target.likes.includes(userId)) {
          alreadyLiked = true;
          return prev;
        }

        authorId = target.authorId;
        newTotal = target.likes.length + 1;

        return prev.map((post) =>
          post.id !== postId
            ? post
            : { ...post, likes: [...post.likes, userId] },
        );
      });

      // QUOTA FIX: Short-circuit if they already liked it!
      if (alreadyLiked) return;

      try {
        const postRef = doc(db, "posts", postId);
        await updateDoc(postRef, { likes: arrayUnion(userId) });

        if (authorId && authorId !== userId) {
          await createNotification({
            recipientId: authorId,
            senderId: userId,
            type: "like",
            postId,
            totalLikes: newTotal,
          } as any);
        }
      } catch (err) {
        console.error("Failed to like post:", err);
      }
    },
    [user, createNotification],
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

        const newComment = buildComment({ user, text });
        updatedComments = [...target.comments, newComment];

        return prev.map((post) =>
          post.id !== postId ? post : { ...post, comments: updatedComments },
        );
      });

      try {
        const postRef = doc(db, "posts", postId);
        await updateDoc(postRef, {
          comments: serializeComments(updatedComments),
        });

        // Only send a notification if the user is commenting on someone else's post
        if (authorId && authorId !== user.uid) {
          await createNotification({
            recipientId: authorId,
            senderId: user.uid,
            type: "comment",
            postId,
          });
        }
      } catch (err) {
        console.error("Failed to add comment:", err);
      }
    },
    [user, createNotification],
  );

  const toggleReaction = useCallback(
    async (postId: string, commentId: string, emoji: string) => {
      if (!user) return;

      const userId = user.uid;
      let updatedComments: Post["comments"] = [];

      setPosts((prev) => {
        const target = prev.find((p) => p.id === postId);
        if (!target) return prev;

        // The logic here is a bit dense: we need to find the specific emoji reaction,
        // check if the user is in the list, and either add or remove them.
        updatedComments = target.comments.map((comment) => {
          if (comment.id !== commentId) return comment;

          const reactionIndex = comment.reactions.findIndex(
            (r) => r.emoji === emoji,
          );

          // The emoji already exists on this comment
          if (reactionIndex !== -1) {
            const reaction = comment.reactions[reactionIndex];
            const hasReacted = reaction.users.includes(userId);

            const updatedUsers = hasReacted
              ? reaction.users.filter((u) => u !== userId)
              : [...reaction.users, userId];

            // If the user was the only one who reacted and they just un-reacted, drop the emoji entirely
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

          // It's a new emoji reaction for this comment
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
        await updateDoc(postRef, {
          comments: serializeComments(updatedComments),
        });
      } catch (err) {
        console.error("Failed to toggle reaction:", err);
      }
    },
    [user],
  );

  const deletePost = useCallback(
    async (postId: string) => {
      if (!user) return;

      const postToDelete = posts.find((p) => p.id === postId);
      if (!postToDelete) return;

      // Hide immediately from the UI
      setPosts((prev) => prev.filter((p) => p.id !== postId));

      try {
        await deleteDoc(doc(db, "posts", postId));
      } catch (err) {
        console.error("Failed to delete post:", err);

        // Rollback: if the delete fails on the backend, we restore the post.
        // We use the original createdAt timestamp to put it exactly back where it belongs in the timeline.
        setPosts((prev) => {
          const index = prev.findIndex(
            (p) => p.createdAt < postToDelete.createdAt,
          );
          const restored = [...prev];
          if (index === -1) {
            restored.push(postToDelete);
          } else {
            restored.splice(index, 0, postToDelete);
          }
          return restored;
        });
        showToast("Failed to delete post. Please try again.", "error");
      }
    },
    [user, posts, showToast],
  );

  return (
    <PostContext.Provider
      value={{
        posts,
        postsLoading,
        hasMore,
        loadMorePosts,
        addPost,
        toggleLike,
        likePost,
        addComment,
        toggleReaction,
        deletePost,
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
