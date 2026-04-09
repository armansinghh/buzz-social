export default function Profile() {
  return (
    <div className="flex flex-col gap-6">
      {/* Profile Header */}
      <div className="flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-[var(--bg-tertiary)]" />
        
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold">Username</h2>
          <p className="text-sm text-[var(--text-muted)]">
            Bio goes here...
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="flex gap-6 text-sm">
        <div>
          <span className="font-semibold">0</span>{" "}
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

        {/* Placeholder for posts */}
        <div className="text-sm text-[var(--text-muted)]">
          No posts yet.
        </div>
      </div>
    </div>
  );
}