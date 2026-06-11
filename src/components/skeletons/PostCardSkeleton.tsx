export default function PostCardSkeleton() {
  return (
    <div className="bg-(--bg-primary) rounded-2xl border border-(--border-color) overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
        <div className="w-8 h-8 rounded-full skeleton shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 w-28 rounded skeleton" />
          <div className="h-3 w-16 rounded skeleton" />
        </div>
      </div>

      {/* Media */}
      <div className="h-52 skeleton" />

      {/* Content */}
      <div className="px-4 pb-4 pt-3 space-y-3">
        {/* Caption lines */}
        <div className="space-y-2">
          <div className="h-3.5 w-full rounded skeleton" />
          <div className="h-3.5 w-3/4 rounded skeleton" />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-1">
          <div className="h-8 w-14 rounded-lg skeleton" />
          <div className="h-8 w-14 rounded-lg skeleton" />
        </div>

        {/* Comment input */}
        <div className="border-t border-(--border-color) pt-3 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full skeleton shrink-0" />
          <div className="h-3.5 w-36 rounded skeleton" />
        </div>
      </div>
    </div>
  );
}