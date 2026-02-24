import PostCard from "@/features/posts/PostCard";
import type { Post } from "@/features/posts/posts.types";

export default function Home() {
  const mockPosts: Post[] = [
    {
      id: "1",
      author: "Alice Johnson",
      content: "Just finished building the Buzz layout 🚀",
      createdAt: "2h ago",
      likes: 12,
    },
    {
      id: "2",
      author: "Rahul Sharma",
      content: "React + TypeScript feels so clean when structured properly.",
      createdAt: "5h ago",
      likes: 28,
    },
    {
      id: "3",
      author: "Sophia Lee",
      content: "Working on a new social platform called Buzz 👀",
      createdAt: "1d ago",
      likes: 45,
    },
  ];

  return (
    <div className="space-y-6">
      {mockPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}