export default function SplashScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-(--bg-primary)">
      <div
        className="flex items-center gap-2 animate-[fade-in_0.4s_ease_forwards]"
      >
        <span className="text-4xl font-bold tracking-tight text-(--text-primary)">
          buzz
        </span>
        <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
      </div>
    </div>
  );
}