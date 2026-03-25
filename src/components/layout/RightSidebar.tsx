import Avatar from "@/components/ui/Avatar";

const SUGGESTED_USERS = [
  { id: "riya", name: "Riya Sharma", handle: "@riya" },
  { id: "alex", name: "Alex Chen", handle: "@alex" },
  { id: "pal", name: "Pal Verma", handle: "@pal" },
  { id: "john", name: "John Doe", handle: "@john" },
];

export default function RightSidebar() {
  return (
    <div className="flex flex-col gap-6 pt-2">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-3 px-1">
          Suggested
        </h2>
        <div className="flex flex-col gap-1">
          {SUGGESTED_USERS.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer group"
            >
              <Avatar name={user.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {user.name}
                </p>
                <p className="text-xs text-[var(--text-muted)] truncate">
                  {user.handle}
                </p>
              </div>
              <button className="text-xs font-semibold text-blue-500 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="px-1">
        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
          © 2026 Buzz · Made with ❤️ by Arman Singh
        </p>
      </div>
    </div>
  );
}