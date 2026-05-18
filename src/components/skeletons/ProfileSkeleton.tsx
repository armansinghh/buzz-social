import PostCardSkeleton from "@/components/skeletons/PostCardSkeleton";

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
      <PostCardSkeleton />
      <PostCardSkeleton />
    </div>
  );
}