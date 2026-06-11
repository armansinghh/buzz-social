import type { Post } from "@/types/post";

// Time-decay trending score (Hacker News gravity)
export function trendingScore(post: Post): number {
  const ageHours = (Date.now() - new Date(post.createdAt).getTime()) / 3_600_000;
  return post.likes.length / Math.pow(ageHours + 2, 1.5);
}

// Word-boundary safe hashtag extraction
export function extractHashtags(posts: Post[]): { tag: string; count: number }[] {
  const counts: Record<string, number> = {};
  posts.forEach((p) => {
    const matches = p.caption.match(/(?<![a-zA-Z0-9_])#[a-zA-Z]\w*/g) ?? [];
    matches.forEach((tag) => {
      const lower = tag.toLowerCase();
      counts[lower] = (counts[lower] ?? 0) + 1;
    });
  });
  return Object.entries(counts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

// Proper whole-token hashtag post filter
export function postMatchesTag(post: Post, tag: string): boolean {
  const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(?<![a-zA-Z0-9_])${escaped}(?![a-zA-Z0-9_])`, "i");
  return pattern.test(post.caption);
}