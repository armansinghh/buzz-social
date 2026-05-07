export default function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Profile header card */}
      <div className="bg-(--bg-primary) rounded-2xl border border-(--border-color) overflow-hidden">
        {/* Banner */}
        <div className="h-24 skeleton" />

        <div className="px-5 pb-5">
          {/* Avatar + button row */}
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="w-14 h-14 rounded-full skeleton ring-4 ring-(--bg-primary)" />
            <div className="h-8 w-24 rounded-xl skeleton" />
          </div>

          {/* Name + username */}
          <div className="space-y-2">
            <div className="h-5 w-36 rounded-lg skeleton" />
            <div className="h-4 w-24 rounded-lg skeleton" />
          </div>

          {/* Stats */}
          <div className="flex gap-5 mt-4">
            <div className="h-4 w-16 rounded skeleton" />
            <div className="h-4 w-20 rounded skeleton" />
            <div className="h-4 w-20 rounded skeleton" />
          </div>
        </div>
      </div>

      {/* Post cards */}
      {[1, 2].map((i) => (
        <div
          key={i}
          className="bg-(--bg-primary) rounded-2xl border border-(--border-color) p-4 space-y-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full skeleton" />
            <div className="h-4 w-28 rounded skeleton" />
          </div>
          <div className="h-48 rounded-xl skeleton" />
          <div className="h-3 w-3/4 rounded skeleton" />
        </div>
      ))}
    </div>
  );
}