export default function SearchSkeleton() {
  return (
    <div className="space-y-2 pt-1">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3.5 rounded-2xl border border-(--border-color) bg-(--bg-primary)"
          style={{ opacity: 1 - (i - 1) * 0.25 }}
        >
          <div className="w-10 h-10 rounded-full skeleton shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-32 rounded skeleton" />
            <div className="h-3 w-20 rounded skeleton" />
          </div>
        </div>
      ))}
    </div>
  );
}