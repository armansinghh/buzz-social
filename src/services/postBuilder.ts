import type { Post, Comment } from "@/types/post";
import type { User } from "firebase/auth";
import type { UserProfile } from "@/types/user";
import { serverTimestamp } from "firebase/firestore";

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
}): Omit<Post, "id"> { // Removed authorUsername/authorAvatar from Omit
  
  const postData: any = {
    authorId: user.uid,
    authorUsername: profile?.username || "user", // MUST exist for rules
    caption,
    likes: [],
    comments: [],
    createdAt: serverTimestamp(),
  };

  if (media) {
    postData.media = media;
  }

  // Only attach avatar if it's a valid URL, otherwise rules will block it
  if (profile?.avatar && profile.avatar.startsWith("https://")) {
    postData.authorAvatar = profile.avatar;
  }

  return postData;
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
    // Reverted to string: Firestore doesn't allow serverTimestamp inside arrays!
    createdAt: new Date().toISOString(), 
  };
}