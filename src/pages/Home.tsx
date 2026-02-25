import PostCard from "@/features/posts/PostCard";
import { usePosts } from "@/features/posts/PostContext";

export default function Home() {
const { posts } = usePosts();

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}