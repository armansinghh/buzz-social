import type { Post, Comment } from "@/types/post";
import type { User } from "firebase/auth";
import type { UserProfile } from "@/types/user";

export function buildPost({
  user,
  profile,
  caption,
  media,
}: {
  user: User;
  profile: UserProfile | null;
  caption: string;
  media?: { url: string; type: "image" | "video" };
}): Omit<Post, "id"> {
  return {
    authorId: user.uid,

    authorUsername:
      profile?.username || user.displayName || "User",

    authorAvatar:
      profile?.avatar || user.photoURL || "",

    caption,

    media,

    likes: [],

    comments: [],

    createdAt: new Date().toISOString(),
  };
}

export function buildComment({
  user,
  profile,
  text,
}: {
  user: User;
  profile: UserProfile | null;
  text: string;
}): Comment {
  return {
    id: crypto.randomUUID(),

    authorId: user.uid,

    authorUsername:
      profile?.username || user.displayName || "User",

    authorAvatar:
      profile?.avatar || user.photoURL || "",

    text,

    reactions: [],

    createdAt: new Date().toISOString(),
  };
}