export default function AppSkeleton() {
  return (
    <div className="flex min-h-screen bg-(--bg-primary)">
      
      {/* Left Sidebar */}
      <div className="hidden md:flex w-64 flex-col p-4 gap-4">
        <div className="h-10 w-32 bg-(--bg-secondary) animate-pulse rounded-xl" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 bg-(--bg-secondary) animate-pulse rounded-lg" />
        ))}
      </div>

      {/* Main Feed */}
      <div className="flex-1 max-w-2xl mx-auto p-4 space-y-6">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl bg-(--bg-secondary) space-y-3 animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-(--bg-tertiary)" />
              <div className="h-4 w-32 bg-(--bg-tertiary) rounded" />
            </div>
            <div className="h-4 w-full bg-(--bg-tertiary) rounded" />
            <div className="h-4 w-3/4 bg-(--bg-tertiary) rounded" />
            <div className="h-48 bg-(--bg-tertiary) rounded-xl" />
          </div>
        ))}
      </div>

      {/* Right Sidebar */}
      <div className="hidden lg:flex w-80 flex-col p-4 gap-4">
        <div className="h-40 bg-(--bg-secondary) animate-pulse rounded-xl" />
        <div className="h-40 bg-(--bg-secondary) animate-pulse rounded-xl" />
      </div>
    </div>
  );
}