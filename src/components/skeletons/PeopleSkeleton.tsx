export default function PeopleSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-4 bg-(--bg-primary) rounded-2xl border border-(--border-color)"
        >
          <div className="w-10 h-10 rounded-full skeleton shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-28 rounded skeleton" />
            <div className="h-3 w-20 rounded skeleton" />
          </div>
          <div className="h-7 w-16 rounded-lg skeleton shrink-0" />
        </div>
      ))}
    </div>
  );
}