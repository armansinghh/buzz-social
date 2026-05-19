import { useState, useRef } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import SearchSkeleton from "@/components/skeletons/SearchSkeleton";
import PersonCard from "./components/PersonCard";
import PostResult from "./components/PostResult";
import { useSearchData } from "./hooks/useSearchData";

type FilterTab = "all" | "people" | "posts";

export default function Search() {
  usePageTitle("Search");
  const {
    search,
    setSearch,
    debouncedSearch,
    users,
    posts,
    loading,
    hasSearched,
    clearSearch,
  } = useSearchData();

  const [focused, setFocused] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    clearSearch();
    setActiveFilter("all");
    inputRef.current?.focus();
  };

  const hasResults = users.length > 0 || posts.length > 0;
  const showUsers = activeFilter === "all" || activeFilter === "people";
  const showPosts = activeFilter === "all" || activeFilter === "posts";

  const filters: { id: FilterTab; label: string; count?: number }[] = [
    { id: "all", label: "All" },
    { id: "people", label: "People", count: users.length },
    { id: "posts", label: "Posts", count: posts.length },
  ];

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div
        className={`flex items-center gap-3 px-4 py-3 mt-4 rounded-2xl border transition-all duration-150 bg-(--bg-primary)
          ${focused ? "border-(--accent) ring-2 ring-(--accent)/10" : "border-(--border-color)"}`}
        style={{ boxShadow: focused ? "var(--shadow-sm)" : "none" }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 transition-colors ${focused ? "text-(--text-secondary)" : "text-(--text-muted)"}`}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          ref={inputRef}
          type="text"
          placeholder="Search posts, people…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 bg-transparent outline-none text-sm text-(--text-primary) placeholder:text-(--text-muted)"
          autoComplete="off"
          spellCheck={false}
        />

        {loading ? (
          <div className="w-4 h-4 border-2 border-(--border-color) border-t-(--text-secondary) rounded-full animate-spin shrink-0" />
        ) : search ? (
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleClear}
            className="w-5 h-5 flex items-center justify-center rounded-full bg-(--bg-tertiary) text-(--text-muted) hover:bg-(--border-color) hover:text-(--text-primary) transition-colors shrink-0"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        ) : null}
      </div>

      {/* Filter pills */}
      {hasSearched && hasResults && !loading && (
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all
                ${
                  activeFilter === f.id
                    ? "bg-(--text-primary) text-(--bg-primary) border-transparent"
                    : "bg-(--bg-primary) text-(--text-secondary) border-(--border-color) hover:border-(--text-muted)"
                }`}
            >
              {f.label}
              {f.count !== undefined && f.id !== "all" && (
                <span
                  className={`tabular-nums ${activeFilter === f.id ? "opacity-60" : "text-(--text-muted)"}`}
                >
                  {f.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Content Area */}
      <div className="space-y-5">
        {loading && <SearchSkeleton />}

        {/* Empty — no query */}
        {!loading && !search && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-(--bg-tertiary) flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-(--text-muted) opacity-60">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <p className="text-sm font-medium text-(--text-primary)">
              Find anything on Buzz
            </p>
            <p className="text-xs text-(--text-muted) text-center max-w-50 leading-relaxed">
              Search by username, caption, or hashtag to discover posts and people.
            </p>
          </div>
        )}

        {/* No results */}
        {!loading && hasSearched && !hasResults && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-(--bg-tertiary) flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-(--text-muted) opacity-60">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <p className="text-sm font-medium text-(--text-primary)">
              No results for "{debouncedSearch}"
            </p>
            <p className="text-xs text-(--text-muted)">
              Try a different keyword or check the spelling
            </p>
          </div>
        )}

        {/* People */}
        {!loading && showUsers && users.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-(--text-muted) mb-3">
              People · {users.length}
            </h2>
            <div className="space-y-2">
              {users.map((u) => (
                <PersonCard key={u.uid} person={u} query={debouncedSearch} />
              ))}
            </div>
          </section>
        )}

        {/* Posts */}
        {!loading && showPosts && posts.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-(--text-muted) mb-3">
              Posts · {posts.length}
            </h2>
            <div className="space-y-2">
              {posts.slice(0, 20).map((p) => (
                <PostResult key={p.id} post={p} query={debouncedSearch} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}