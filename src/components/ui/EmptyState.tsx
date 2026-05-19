export default function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-(--text-muted)">
      <div className="opacity-40">{icon}</div>
      <p className="text-sm font-medium text-(--text-secondary)">{title}</p>
      {subtitle && <p className="text-xs text-center max-w-xs">{subtitle}</p>}
    </div>
  );
}