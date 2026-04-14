import PostCard from "@/features/posts/PostCard";
import { usePosts } from "@/features/posts/PostContext";
import { useAuth } from "@/features/auth/AuthContext";

export default function Home() {
  const { posts } = usePosts();
  const { user, profile } = useAuth();

  const currentUserId = user?.uid;

  const followingIds = profile?.following ?? [];

  const personalizedPosts = posts.filter(
    (post) =>
      post.authorId === currentUserId ||
      followingIds.includes(post.authorId)
  );

  return (
    <div className="space-y-6">
      {personalizedPosts.length === 0 ? (
        <div className="text-center py-10 text-(--text-muted)">
          No posts from people you follow yet.
        </div>
      ) : (
        personalizedPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))
      )}
    </div>
  );
}