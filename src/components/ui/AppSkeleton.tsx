export default function AppSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-(--bg-primary)">
      <div className="flex items-center gap-2">
        <span className="text-3xl font-bold tracking-tight text-(--text-primary)">
          buzz
        </span>
        <span className="w-2 h-2 rounded-full bg-amber-400" />
      </div>
    </div>
  );
}