import type { Post, Comment } from "@/types/post";
import type { User } from "firebase/auth";
import { serverTimestamp } from "firebase/firestore";

export function buildPost({
  user,
  caption,
  media,
}: {
  user: User;
  caption: string;
  media?: { url: string; type: "image" | "video" };
}): Omit<Post, "id" | "authorUsername" | "authorAvatar"> {
  
  const postData: any = {
    authorId: user.uid,
    caption,
    likes: [],
    comments: [],
    createdAt: serverTimestamp(),
  };

  if (media) {
    postData.media = media;
  }

  return postData;
}

export function buildComment({
  user,
  text,
}: {
  user: User;
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