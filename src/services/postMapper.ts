import type { Post, Comment } from "@/types/post";

export function mapPost(docId: string, data: Record<string, unknown>): Post {
  return {
    id: docId,

    authorId: typeof data.authorId === "string" ? data.authorId : "",

    authorUsername:
      typeof data.authorUsername === "string" && data.authorUsername
        ? data.authorUsername
        : "User",

    // authorPhoto is a legacy ghost field — never read it; only authorAvatar is canonical
    authorAvatar:
      typeof data.authorAvatar === "string" && data.authorAvatar
        ? data.authorAvatar
        : undefined,

    caption: typeof data.caption === "string" ? data.caption : "",

    media:
      data.media &&
      typeof (data.media as Record<string, unknown>).url === "string" &&
      typeof (data.media as Record<string, unknown>).type === "string"
        ? {
            url: (data.media as Record<string, unknown>).url as string,
            type: (data.media as Record<string, unknown>).type as
              | "image"
              | "video",
          }
        : undefined,

    likes: Array.isArray(data.likes) ? (data.likes as string[]) : [],

    comments: Array.isArray(data.comments)
      ? (data.comments as Record<string, unknown>[]).map(mapComment)
      : [],

    createdAt:
      typeof data.createdAt === "string"
        ? data.createdAt
        : new Date().toISOString(),
  };
}

function mapComment(data: Record<string, unknown>): Comment {
  return {
    id:
      typeof data.id === "string" && data.id ? data.id : crypto.randomUUID(),

    authorId: typeof data.authorId === "string" ? data.authorId : "",

    authorUsername:
      typeof data.authorUsername === "string" && data.authorUsername
        ? data.authorUsername
        : "User",

    // authorPhoto is a legacy ghost field — only authorAvatar is canonical
    authorAvatar:
      typeof data.authorAvatar === "string" && data.authorAvatar
        ? data.authorAvatar
        : undefined,

    text: typeof data.text === "string" ? data.text : "",

    reactions: Array.isArray(data.reactions)
      ? (data.reactions as Record<string, unknown>[]).map((r) => ({
          emoji: typeof r.emoji === "string" ? r.emoji : "",
          users: Array.isArray(r.users) ? (r.users as string[]) : [],
        }))
      : [],

    createdAt:
      typeof data.createdAt === "string"
        ? data.createdAt
        : new Date().toISOString(),
  };
}