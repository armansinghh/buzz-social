"use client"

export default function TrendingTag({
  tag,
  count,
  rank,
  onClick,
  active,
}: {
  tag: string;
  count: number;
  rank: number;
  onClick: () => void;
  active: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`group flex items-center gap-3 w-full px-4 py-3 text-left transition-all
        ${active ? "bg-(--accent) text-(--bg-primary)" : "hover:bg-(--bg-tertiary) text-(--text-primary)"}`}
    >
      <span
        className={`text-xs font-bold w-5 tabular-nums shrink-0 ${active ? "opacity-70" : "text-(--text-muted)"}`}
      >
        {rank}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{tag}</p>
        <p
          className={`text-xs mt-0.5 ${active ? "opacity-70" : "text-(--text-muted)"}`}
        >
          {count} {count === 1 ? "post" : "posts"}
        </p>
      </div>
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`shrink-0 transition-transform group-hover:translate-x-0.5 ${active ? "opacity-70" : "text-(--text-muted)"}`}
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  );
}