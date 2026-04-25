import type { Post, Comment } from "@/types/post";
import type { User } from "firebase/auth";
import type { UserProfile } from "@/types/user";

export function buildPost({
  user,
  caption,
  media,
}: {
  user: User;
  profile: UserProfile | null;
  caption: string;
  media?: { url: string; type: "image" | "video" };
}): Omit<Post, "id" | "authorUsername" | "authorAvatar"> {
  return {
    authorId: user.uid,
    caption,
    ...(media ? { media } : {}),
    likes: [],
    comments: [],
    createdAt: new Date().toISOString(),
  };
}

export function buildComment({
  user,
  text,
}: {
  user: User;
  profile: UserProfile | null;
  text: string;
}): Comment {
  return {
    id: crypto.randomUUID(),
    authorId: user.uid,
    text,
    reactions: [],
    createdAt: new Date().toISOString(),
  };
}