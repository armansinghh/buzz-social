import type { Post, Comment } from "@/types/post";

export function mapPost(docId: string, data: any): Post {
  return {
    id: docId,

    authorId: data.authorId ?? "",

    authorUsername: data.authorUsername ?? "User",

    authorAvatar:
      data.authorAvatar || data.authorPhoto || undefined,

    caption: data.caption ?? "",

    media: data.media
      ? {
          url: data.media.url,
          type: data.media.type,
        }
      : undefined,

    likes: Array.isArray(data.likes) ? data.likes : [],

    comments: Array.isArray(data.comments)
      ? data.comments.map(mapComment)
      : [],

    createdAt:
      typeof data.createdAt === "string"
        ? data.createdAt
        : new Date().toISOString(),
  };
}

function mapComment(data: any): Comment {
  return {
    id: data.id ?? crypto.randomUUID(),

    authorId: data.authorId ?? "",

    authorUsername: data.authorUsername ?? "User",

    authorAvatar:
      data.authorAvatar || data.authorPhoto || undefined,

    text: data.text ?? "",

    reactions: Array.isArray(data.reactions)
      ? data.reactions
      : [],

    createdAt:
      typeof data.createdAt === "string"
        ? data.createdAt
        : new Date().toISOString(),
  };
}