import { useAuth } from "@/features/auth/AuthContext";
import { usePosts } from "@/features/posts/PostContext";
import Avatar from "@/components/ui/Avatar";
import PostCard from "@/features/posts/PostCard";

export default function Profile() {
  const { user, profile } = useAuth();
  const { posts } = usePosts();

  const userId = user?.uid || "guest";

  const displayName =
    profile?.name || profile?.username || user?.email || "User";

  const username =
    profile?.username ||
    displayName.toLowerCase().replace(/\s+/g, "");

  const bio = "Building something cool 🚀";

  const userPosts = posts.filter((post) => post.authorId === userId);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6">
        <Avatar
          name={displayName}
          src={profile?.photoURL}
          size="lg"
          className="self-start sm:self-auto"
        />

        <div className="flex flex-col gap-1">
          <h2 className="text-xl sm:text-2xl font-semibold leading-tight">
            {displayName}
          </h2>

          <p className="text-sm text-(--text-muted)">
            @{username}
          </p>

          <p className="text-sm mt-1 text-(--text-secondary) max-w-md">
            {bio}
          </p>

          {/* Stats (mobile inline) */}
          <div className="flex gap-5 mt-3 text-sm sm:hidden">
            <span>
              <span className="font-semibold">{userPosts.length}</span>{" "}
              <span className="text-(--text-muted)">Posts</span>
            </span>
            <span>
              <span className="font-semibold">0</span>{" "}
              <span className="text-(--text-muted)">Followers</span>
            </span>
            <span>
              <span className="font-semibold">0</span>{" "}
              <span className="text-(--text-muted)">Following</span>
            </span>
          </div>
        </div>
      </div>

      {/* Stats (desktop) */}
      <div className="hidden sm:flex gap-8 text-sm mt-6">
        <div>
          <span className="font-semibold">{userPosts.length}</span>{" "}
          <span className="text-(--text-muted)">Posts</span>
        </div>
        <div>
          <span className="font-semibold">0</span>{" "}
          <span className="text-(--text-muted)">Followers</span>
        </div>
        <div>
          <span className="font-semibold">0</span>{" "}
          <span className="text-(--text-muted)">Following</span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-(--border-color) mt-6" />

      {/* Posts */}
      <div className="flex flex-col gap-6 mt-6">
        <h3 className="text-sm font-semibold text-(--text-muted) tracking-wide">
          POSTS
        </h3>

        {userPosts.length === 0 ? (
          <div className="text-sm text-(--text-muted) text-center py-10">
            No posts yet.
          </div>
        ) : (
          userPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </div>
    </div>
  );
}