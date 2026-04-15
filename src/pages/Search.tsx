import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Avatar from "@/components/ui/Avatar";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchUser {
  uid: string;
  username: string;
  name: string;
  avatar?: string;
}

export default function Search() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    const searchUsers = async () => {
      if (!debouncedSearch.trim()) {
        setUsers([]);
        setHasSearched(false);
        return;
      }

      try {
        setLoading(true);
        const q = query(
          collection(db, "users"),
          orderBy("username"),
          where("username", ">=", debouncedSearch.toLowerCase()),
          where("username", "<=", debouncedSearch.toLowerCase() + "\uf8ff"),
        );
        const snapshot = await getDocs(q);
        const results = snapshot.docs.map((doc) => doc.data()) as SearchUser[];
        setUsers(results);
        setHasSearched(true);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    };

    searchUsers();
  }, [debouncedSearch]);

  const clearSearch = () => {
    setSearch("");
    setUsers([]);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center gap-2 pt-1">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-(--text-muted)"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <h1 className="text-lg font-semibold text-(--text-primary)">Search</h1>
      </div>

      {/* Search input */}
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-150
          bg-(--bg-primary)
          ${
            focused
              ? "border-(--accent) ring-2 ring-(--accent)/10"
              : "border-(--border-color)"
          }`}
        style={{ boxShadow: focused ? "var(--shadow-sm)" : "none" }}
      >
        {/* Search icon */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 transition-colors ${
            focused ? "text-(--text-secondary)" : "text-(--text-muted)"
          }`}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          ref={inputRef}
          type="text"
          placeholder="Search by username…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 bg-transparent outline-none text-sm text-(--text-primary) placeholder:text-(--text-muted)"
          autoComplete="off"
          spellCheck={false}
        />

        {/* Loading spinner or clear button */}
        {loading ? (
          <div className="w-4 h-4 border-2 border-(--border-color) border-t-(--text-secondary) rounded-full animate-spin shrink-0" />
        ) : search ? (
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={clearSearch}
            className="w-5 h-5 flex items-center justify-center rounded-full bg-(--bg-tertiary) text-(--text-muted) hover:bg-(--border-color) hover:text-(--text-primary) transition-colors shrink-0"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        ) : null}
      </div>

      {/* Results area */}
      <div className="space-y-1">
        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-1 pt-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ opacity: 1 - i * 0.2 }}
              >
                <div className="w-10 h-10 rounded-full skeleton shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-28 rounded skeleton" />
                  <div className="h-3 w-20 rounded skeleton" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state — no query */}
        {!loading && !search && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-(--text-muted)">
            <div className="w-14 h-14 rounded-2xl bg-(--bg-tertiary) flex items-center justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-60"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <p className="text-sm font-medium text-(--text-secondary)">Find people on Buzz</p>
            <p className="text-xs text-(--text-muted) text-center max-w-50">
              Search by username to discover and connect with others.
            </p>
          </div>
        )}

        {/* No results */}
        {!loading && hasSearched && users.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-(--text-muted)">
            <div className="w-14 h-14 rounded-2xl bg-(--bg-tertiary) flex items-center justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-60"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <p className="text-sm font-medium text-(--text-secondary)">
              No results for "{debouncedSearch}"
            </p>
            <p className="text-xs text-(--text-muted)">Try a different username</p>
          </div>
        )}

        {/* Results list */}
        {!loading && users.length > 0 && (
          <>
            <p className="text-xs font-medium text-(--text-muted) px-1 pb-1">
              {users.length} {users.length === 1 ? "result" : "results"}
            </p>
            <div
              className="bg-(--bg-primary) rounded-2xl border border-(--border-color) overflow-hidden"
              style={{ boxShadow: "var(--shadow-sm)" }}
            >
              {users.map((user, idx) => (
                <Link
                  key={user.uid}
                  to={`/profile/${user.username}`}
                  className={`flex items-center gap-3 px-4 py-3.5 hover:bg-(--bg-secondary) transition-colors group
                    ${idx !== users.length - 1 ? "border-b border-(--border-color)" : ""}`}
                >
                  <Avatar name={user.username} src={user.avatar} size="md" />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-(--text-primary) truncate">
                      {user.username}
                    </p>
                    {user.name && (
                      <p className="text-xs text-(--text-muted) truncate">{user.name}</p>
                    )}
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
                    className="text-(--text-muted) opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}