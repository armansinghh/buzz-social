export function timeAgo(dateValue: any): string {
  if (!dateValue) return "";

  let date: Date;

  // 1. Check if it's a Firestore Timestamp (has a .toDate() method)
  if (typeof dateValue?.toDate === "function") {
    date = dateValue.toDate();
  }
  // 2. Check if it's already a Date object
  else if (dateValue instanceof Date) {
    date = dateValue;
  }
  // 3. Otherwise, parse it as a string/number
  else {
    date = new Date(dateValue);
  }

  // Failsafe if the date is completely unparseable
  if (isNaN(date.getTime())) return "";

  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60_000);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;

  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;

  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark
        key={i}
        className="bg-(--accent)/15 text-(--accent) rounded-[3px] px-0.5 not-italic"
      >
        {part}
      </mark>
    ) : (
      part
    ),
  );
}
