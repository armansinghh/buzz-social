export function formatRelativeTime(dateString: string): string {
  const now = Date.now();
  const created = new Date(dateString).getTime();

  const diffSeconds = Math.floor((now - created) / 1000);

  // 0–60 seconds
  if (diffSeconds < 60) {
    return "just now";
  }

  const diffMinutes = Math.floor(diffSeconds / 60);

  // 1–59 minutes
  if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  // 1–23 hours
  if (diffHours < 24) {
    return `${diffHours}h`;
  }

  const diffDays = Math.floor(diffHours / 24);

  // 1–6 days
  if (diffDays < 7) {
    return `${diffDays}d`;
  }

  const diffWeeks = Math.floor(diffDays / 7);

  // 1+ weeks
  return `${diffWeeks}w`;
}