export default function AppSkeleton() {
  return (
    <div className="min-h-screen bg-(--bg-primary)">
      {/* Navbar */}
      <div className="h-16 border-b border-(--border-color) flex items-center justify-between px-6">
        <div className="h-6 w-20 bg-(--skeleton-base) animate-pulse rounded" />
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 rounded-full bg-(--skeleton-base) animate-pulse" />
          <div className="h-8 w-16 bg-(--skeleton-base) animate-pulse rounded" />
        </div>
      </div>

      <div className="flex">
        {/* LEFT SIDEBAR */}
        <div className="w-64 border-r border-(--border-color) p-4 space-y-4 hidden md:block">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-10 bg-(--skeleton-base) animate-pulse rounded-xl"
            />
          ))}
        </div>

        {/* CENTER FEED */}
        <div className="flex-1 max-w-2xl mx-auto p-6 space-y-6">
          {/* Feed Tabs */}
          <div className="flex gap-2 py-5 justify-center">
            <div className="h-10 w-24 bg-(--skeleton-base) animate-pulse rounded-xl" />
            <div className="h-10 w-32 bg-(--skeleton-base) animate-pulse rounded-xl" />
          </div>

          {/* Posts */}
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-(--bg-secondary) rounded-2xl p-4 space-y-4"
            >
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-(--skeleton-highlight) animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 bg-(--skeleton-highlight) animate-pulse rounded" />
                  <div className="h-3 w-16 bg-(--skeleton-highlight) animate-pulse rounded" />
                </div>
                <div className="w-6 h-6 bg-(--skeleton-highlight) animate-pulse rounded" />
              </div>

              {/* Image */}
              <div className="h-64 w-full bg-(--skeleton-highlight) animate-pulse rounded-xl" />

              {/* Caption */}
              <div className="h-4 w-3/4 bg-(--skeleton-highlight) animate-pulse rounded" />

              {/* Actions */}
              <div className="flex gap-6">
                <div className="h-4 w-10 bg-(--skeleton-highlight) animate-pulse rounded" />
                <div className="h-4 w-10 bg-(--skeleton-highlight) animate-pulse rounded" />
              </div>

              {/* Comment input */}
              <div className="h-10 w-full bg-(--skeleton-highlight) animate-pulse rounded-xl" />
            </div>
          ))}
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="w-64 border-l border-(--border-color) p-4 space-y-4 hidden xl:block">
          <div className="h-4 w-40 bg-(--skeleton-base) animate-pulse rounded" />

          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-(--skeleton-base) animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 bg-(--skeleton-base) animate-pulse rounded" />
                <div className="h-3 w-16 bg-(--skeleton-base) animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}