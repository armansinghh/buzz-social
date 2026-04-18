import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import Avatar from "@/components/ui/Avatar";
import { useAuth } from "@/features/auth/AuthContext";
import { useFollow } from "@/features/follow/FollowContext";
import { useDebounce } from "@/hooks/useDebounce";
import type { Post } from "@/features/posts/posts.types";

// ─── Constants ────────────────────────────────────────────────────────────────
const POSTS_SEARCH_LIMIT = 20;

type FilterTab = "all" | "people" | "posts";

interface SearchUser {
  uid: string;
  username: string;
  name: string;
  avatar?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function highlightText(text: string, query: string): React.ReactNode {
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

// ─── Person card ──────────────────────────────────────────────────────────────
function PersonCard({ person, query }: { person: SearchUser; query: string }) {
  const { user } = useAuth();
  const { followUser, unfollowUser, isFollowing } = useFollow();
  const navigate = useNavigate();

  const followed = isFollowing(person.uid);
  const isOwn = user?.uid === person.uid;

  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    followed ? unfollowUser(person.uid) : followUser(person.uid);
  };

  return (
    <div
      onClick={() => navigate(`/profile/${person.username}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/profile/${person.username}`)}
      className="flex items-center gap-3 p-3.5 bg-(--bg-primary) rounded-2xl border border-(--border-color) hover:border-(--text-muted) transition-all cursor-pointer"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      <Avatar name={person.username} src={person.avatar} size="md" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-(--text-primary) truncate">
          {highlightText(person.name || person.username, query)}
        </p>
        <p className="text-xs text-(--text-muted) truncate mt-0.5">
          @{highlightText(person.username, query)}
        </p>
      </div>
      {!isOwn && (
        <button
          onClick={handleFollow}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0
            ${
              followed
                ? "border border-(--border-color) text-(--text-secondary) hover:border-red-400 hover:text-red-500"
                : "bg-(--accent) text-(--bg-primary) hover:opacity-90"
            }`}
        >
          {followed ? "Following" : "Follow"}
        </button>
      )}
    </div>
  );
}

// ─── Post result card ─────────────────────────────────────────────────────────
function PostResult({ post, query }: { post: Post; query: string }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/post/${post.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/post/${post.id}`)}
      className="flex gap-3 p-3.5 bg-(--bg-primary) rounded-2xl border border-(--border-color) hover:border-(--text-muted) transition-all cursor-pointer"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      {post.media?.type === "image" && (
        <img
          src={post.media.url}
          alt=""
          className="w-16 h-16 rounded-xl object-cover shrink-0 bg-(--bg-tertiary)"
        />
      )}
      {post.media?.type === "video" && (
        <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-(--bg-tertiary)">
          <video src={post.media.url} className="w-full h-full object-cover" muted />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <Avatar
            name={post.authorUsername || "User"}
            src={post.authorPhoto}
            size="xs"
          />
          <span className="text-xs font-semibold text-(--text-primary) truncate">
            {post.authorUsername || "User"}
          </span>
          <span className="text-xs text-(--text-muted) shrink-0">
            · {timeAgo(post.createdAt)}
          </span>
        </div>

        {post.caption && (
          <p className="text-sm text-(--text-primary) line-clamp-2 leading-relaxed">
            {highlightText(post.caption, query)}
          </p>
        )}

        <div className="flex items-center gap-3 mt-1.5">
          <span className="flex items-center gap-1 text-xs text-(--text-muted)">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {post.likes.length}
          </span>
          <span className="flex items-center gap-1 text-xs text-(--text-muted)">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {post.comments.length}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Loading skeletons ────────────────────────────────────────────────────────
function Skeletons() {
  return (
    <div className="space-y-2 pt-1">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3.5 rounded-2xl border border-(--border-color) bg-(--bg-primary)"
          style={{ opacity: 1 - (i - 1) * 0.25 }}
        >
          <div className="w-10 h-10 rounded-full skeleton shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-32 rounded skeleton" />
            <div className="h-3 w-20 rounded skeleton" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Search() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    const searchAll = async () => {
      if (!debouncedSearch.trim()) {
        setUsers([]);
        setPosts([]);
        setHasSearched(false);
        setActiveFilter("all");
        return;
      }

      setLoading(true);
      try {
        const term = debouncedSearch.toLowerCase();

        const usersQuery = query(
          collection(db, "users"),
          orderBy("username"),
          where("username", ">=", term),
          where("username", "<=", term + "\uf8ff"),
        );

        const postsQuery = query(
          collection(db, "posts"),
          orderBy("createdAt", "desc"),
          limit(POSTS_SEARCH_LIMIT),
        );

        const [usersSnap, postsSnap] = await Promise.all([
          getDocs(usersQuery),
          getDocs(postsQuery),
        ]);

        const userResults = usersSnap.docs.map(
          (doc) => doc.data() as SearchUser,
        );

        const allPosts = postsSnap.docs.map((d) => ({
          ...(d.data() as Omit<Post, "id">),
          id: d.id,
        })) as Post[];

        const postResults = allPosts.filter(
          (p) =>
            p.caption?.toLowerCase().includes(term) ||
            p.authorUsername?.toLowerCase().includes(term),
        );

        setUsers(userResults);
        setPosts(postResults);
        setHasSearched(true);
        setActiveFilter("all");
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    };

    searchAll();
  }, [debouncedSearch]);

  const clearSearch = () => {
    setSearch("");
    setUsers([]);
    setPosts([]);
    setHasSearched(false);
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
            onClick={clearSearch}
            className="w-5 h-5 flex items-center justify-center rounded-full bg-(--bg-tertiary) text-(--text-muted) hover:bg-(--border-color) hover:text-(--text-primary) transition-colors shrink-0"
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            >
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

      {/* Content */}
      <div className="space-y-5">
        {loading && <Skeletons />}

        {/* Empty — no query */}
        {!loading && !search && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
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
                className="text-(--text-muted) opacity-60"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <p className="text-sm font-medium text-(--text-primary)">
              Find anything on Buzz
            </p>
            <p className="text-xs text-(--text-muted) text-center max-w-50 leading-relaxed">
              Search by username, caption, or hashtag to discover posts and
              people.
            </p>
          </div>
        )}

        {/* No results */}
        {!loading && hasSearched && !hasResults && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
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
                className="text-(--text-muted) opacity-60"
              >
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