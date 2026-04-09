import { useAuth } from "@/features/auth/AuthContext";
import { usePosts } from "@/features/posts/PostContext";
import Avatar from "@/components/ui/Avatar";

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

  // ✅ Filter user's posts
  const userPosts = posts.filter((post) => post.authorId === userId);

  return (
    <div className="flex flex-col gap-6">
      {/* Profile Header */}
      <div className="flex items-center gap-6">
        <Avatar
          name={displayName}
          src={profile?.photoURL}
          size="lg"
        />

        <div className="flex flex-col">
          <h2 className="text-xl font-semibold">
            {displayName}
          </h2>

          <p className="text-sm text-[var(--text-muted)]">
            @{username}
          </p>

          <p className="text-sm mt-1 text-[var(--text-secondary)]">
            {bio}
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="flex gap-6 text-sm">
        <div>
          <span className="font-semibold">{userPosts.length}</span>{" "}
          <span className="text-[var(--text-muted)]">Posts</span>
        </div>
        <div>
          <span className="font-semibold">0</span>{" "}
          <span className="text-[var(--text-muted)]">Followers</span>
        </div>
        <div>
          <span className="font-semibold">0</span>{" "}
          <span className="text-[var(--text-muted)]">Following</span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[var(--border-color)]" />

      {/* Posts Section */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-[var(--text-muted)]">
          Posts
        </h3>

        {userPosts.length === 0 ? (
          <div className="text-sm text-[var(--text-muted)]">
            No posts yet.
          </div>
        ) : (
          <div className="text-sm text-[var(--text-muted)]">
            {userPosts.length} post(s) found.
          </div>
        )}
      </div>
    </div>
  );
}