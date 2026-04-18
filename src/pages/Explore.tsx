import { useState, useEffect, useRef } from "react";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/features/auth/AuthContext";
import { useFollow } from "@/features/follow/FollowContext";
import { usePosts } from "@/features/posts/PostContext";
import PostCard from "@/features/posts/components/PostCard";
import Avatar from "@/components/ui/Avatar";
import type { Post } from "@/features/posts/posts.types";

type ExploreTab = "trending" | "people" | "media";

type UserProfile = {
  uid: string;
  username?: string;
  name?: string;
  avatar?: string;
  email?: string;
};

// ─────────────────────────────────────────────
// Trending hashtag pill (derived from captions)
// ─────────────────────────────────────────────
function extractHashtags(posts: Post[]): { tag: string; count: number }[] {
  const counts: Record<string, number> = {};
  posts.forEach((p) => {
    const matches = p.caption.match(/#\w+/g) ?? [];
    matches.forEach((tag) => {
      const lower = tag.toLowerCase();
      counts[lower] = (counts[lower] ?? 0) + 1;
    });
  });
  return Object.entries(counts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

// ─────────────────────────────────────────────
// Trending pill
// ─────────────────────────────────────────────
function TrendingTag({
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
      className={`group relative flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left transition-all
        ${active
          ? "bg-(--accent) text-(--bg-primary)"
          : "hover:bg-(--bg-tertiary) text-(--text-primary)"
        }`}
    >
      <span
        className={`text-xs font-bold w-5 tabular-nums shrink-0
          ${active ? "opacity-70" : "text-(--text-muted)"}`}
      >
        {rank}
      </span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${active ? "" : "text-(--text-primary)"}`}>
          {tag}
        </p>
        <p className={`text-xs mt-0.5 ${active ? "opacity-70" : "text-(--text-muted)"}`}>
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
        className={`shrink-0 transition-transform group-hover:translate-x-0.5
          ${active ? "opacity-70" : "text-(--text-muted)"}`}
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  );
}

// ─────────────────────────────────────────────
// People card
// ─────────────────────────────────────────────
function PeopleCard({ person }: { person: UserProfile }) {
  const { user } = useAuth();
  const { followUser, unfollowUser, isFollowing } = useFollow();
  const followed = isFollowing(person.uid);
  const isOwn = user?.uid === person.uid;

  const displayName = person.name || person.username || "User";

  return (
    <div className="flex items-center gap-3 p-4 bg-(--bg-primary) rounded-2xl border border-(--border-color) hover:border-(--text-muted) transition-all"
      style={{ boxShadow: "var(--shadow-sm)" }}>
      <Avatar name={displayName} src={person.avatar} size="md" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-(--text-primary) truncate">{displayName}</p>
        {person.username && (
          <p className="text-xs text-(--text-muted) truncate">@{person.username}</p>
        )}
      </div>
      {!isOwn && (
        <button
          onClick={() => followed ? unfollowUser(person.uid) : followUser(person.uid)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0
            ${followed
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

// ─────────────────────────────────────────────
// Media grid item
// ─────────────────────────────────────────────
function MediaGridItem({
  post,
  onClick,
}: {
  post: Post;
  onClick: () => void;
}) {
  const isVideo = post.media?.type === "video";

  return (
    <button
      onClick={onClick}
      className="relative aspect-square rounded-xl overflow-hidden bg-(--bg-tertiary) group"
    >
      {post.media?.type === "image" ? (
        <img
          src={post.media.url}
          alt=""
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : post.media?.type === "video" ? (
        <video
          src={post.media.url}
          className="w-full h-full object-cover"
          muted
        />
      ) : (
        /* text-only post */
        <div className="w-full h-full flex items-center justify-center p-3">
          <p className="text-xs text-(--text-secondary) text-center line-clamp-4 leading-relaxed">
            {post.caption}
          </p>
        </div>
      )}

      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end p-2 opacity-0 group-hover:opacity-100">
        <div className="flex items-center gap-2 text-white text-xs font-semibold">
          <span>❤️ {post.likes.length}</span>
          <span>💬 {post.comments.length}</span>
        </div>
      </div>

      {isVideo && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </div>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────
// Search bar
// ─────────────────────────────────────────────
function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
      <input
        ref={inputRef}
        type="text"
        placeholder="Search posts, people…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2.5 bg-(--bg-primary) border border-(--border-color) rounded-xl text-sm text-(--text-primary) placeholder:text-(--text-muted) outline-none focus:ring-2 focus:ring-(--accent)/20 focus:border-(--accent) transition-all"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-(--text-muted) hover:text-(--text-primary) transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Explore page
// ─────────────────────────────────────────────
export default function Explore() {
  const { posts } = usePosts();
  const [activeTab, setActiveTab] = useState<ExploreTab>("trending");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // ── Fetch users ───────────────────────────
  useEffect(() => {
    if (activeTab !== "people" && searchQuery === "") return;
    const fetchUsers = async () => {
      setUsersLoading(true);
      try {
        const q = query(collection(db, "users"), limit(30));
        const snap = await getDocs(q);
        setUsers(snap.docs.map((d) => ({ ...(d.data() as UserProfile), uid: d.id })));
      } finally {
        setUsersLoading(false);
      }
    };
    fetchUsers();
  }, [activeTab, searchQuery]);

  // ── Derived data ──────────────────────────
  const hashtags = extractHashtags(posts);

  const mediaPosts = posts.filter((p) => p.media);

  const trendingPosts = activeTag
    ? posts.filter((p) => p.caption.toLowerCase().includes(activeTag))
    : [...posts].sort((a, b) => b.likes.length - a.likes.length);

  // ── Search filtering ──────────────────────
  const q = searchQuery.toLowerCase().trim();

  const filteredPosts = q
    ? posts.filter(
        (p) =>
          p.caption.toLowerCase().includes(q) ||
          p.authorUsername?.toLowerCase().includes(q)
      )
    : null;

  const filteredUsers = q
    ? users.filter(
        (u) =>
          u.username?.toLowerCase().includes(q) ||
          u.name?.toLowerCase().includes(q)
      )
    : null;

  const showSearchResults = q.length > 0;

  // ── Tab config ────────────────────────────
  const tabs: { id: ExploreTab; label: string; icon: React.ReactNode }[] = [
    {
      id: "trending",
      label: "Trending",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      ),
    },
    {
      id: "people",
      label: "People",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      id: "media",
      label: "Media",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      {/* <div>
        <h1 className="text-xl font-bold text-(--text-primary) mb-1">Explore</h1>
        <p className="text-sm text-(--text-muted)">Discover trending posts, people, and topics</p>
      </div> */}

      {/* ── Search ── */}
      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      {/* ── Search results ── */}
      {showSearchResults ? (
        <div className="space-y-5">
          {/* Posts */}
          {filteredPosts && filteredPosts.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-(--text-muted) mb-3">
                Posts · {filteredPosts.length}
              </h2>
              <div className="space-y-4">
                {filteredPosts.slice(0, 10).map((p) => (
                  <PostCard key={p.id} post={p} />
                ))}
              </div>
            </section>
          )}

          {/* Users */}
          {filteredUsers && filteredUsers.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-(--text-muted) mb-3">
                People · {filteredUsers.length}
              </h2>
              <div className="space-y-2">
                {filteredUsers.map((u) => (
                  <PeopleCard key={u.uid} person={u} />
                ))}
              </div>
            </section>
          )}

          {filteredPosts?.length === 0 && filteredUsers?.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-(--text-muted)">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <p className="text-sm font-medium text-(--text-secondary)">No results for "{searchQuery}"</p>
              <p className="text-xs">Try a different keyword</p>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* ── Tabs ── */}
          <div className="flex gap-1 p-1 bg-(--bg-secondary) rounded-xl border border-(--border-color)">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all
                  ${activeTab === tab.id
                    ? "bg-(--bg-primary) text-(--text-primary) shadow-sm"
                    : "text-(--text-muted) hover:text-(--text-secondary)"
                  }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* ── Trending tab ── */}
          {activeTab === "trending" && (
            <div className="space-y-5">
              {/* Hashtag rail */}
              {hashtags.length > 0 && (
                <section>
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-(--text-muted) mb-3 flex items-center gap-2">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="4" y1="9" x2="20" y2="9" />
                      <line x1="4" y1="15" x2="20" y2="15" />
                      <line x1="10" y1="3" x2="8" y2="21" />
                      <line x1="16" y1="3" x2="14" y2="21" />
                    </svg>
                    Topics
                  </h2>
                  <div className="bg-(--bg-primary) rounded-2xl border border-(--border-color) divide-y divide-(--border-color) overflow-hidden"
                    style={{ boxShadow: "var(--shadow-sm)" }}>
                    {hashtags.map((ht, i) => (
                      <TrendingTag
                        key={ht.tag}
                        tag={ht.tag}
                        count={ht.count}
                        rank={i + 1}
                        active={activeTag === ht.tag}
                        onClick={() =>
                          setActiveTag(activeTag === ht.tag ? null : ht.tag)
                        }
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Active tag filter label */}
              {activeTag && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-(--text-muted)">Showing posts for</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-(--accent) text-(--bg-primary) text-xs font-semibold rounded-full">
                    {activeTag}
                    <button onClick={() => setActiveTag(null)} className="opacity-70 hover:opacity-100">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </span>
                </div>
              )}

              {/* Posts */}
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-(--text-muted) mb-3 flex items-center gap-2">
                  {/* <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                  </svg> */}
                  {activeTag ? "Matching posts" : "Most liked"}
                </h2>
                {trendingPosts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3 text-(--text-muted)">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <p className="text-sm">No posts with {activeTag}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {trendingPosts.slice(0, 15).map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ── People tab ── */}
          {activeTab === "people" && (
            <section className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-(--text-muted) mb-3">
                All users
              </h2>
              {usersLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-(--bg-primary) rounded-2xl border border-(--border-color)">
                      <div className="w-10 h-10 rounded-full skeleton shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3.5 w-28 rounded skeleton" />
                        <div className="h-3 w-20 rounded skeleton" />
                      </div>
                      <div className="h-7 w-16 rounded-lg skeleton shrink-0" />
                    </div>
                  ))}
                </div>
              ) : users.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-(--text-muted)">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                  <p className="text-sm">No users found</p>
                </div>
              ) : (
                users.map((u) => <PeopleCard key={u.uid} person={u} />)
              )}
            </section>
          )}

          {/* ── Media tab ── */}
          {activeTab === "media" && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-(--text-muted) mb-3">
                {mediaPosts.length === 1 ? "photo/video" : "photos & videos"}
              </h2>
              {mediaPosts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-(--text-muted)">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <p className="text-sm">No media posts yet</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-1.5">
                    {mediaPosts.map((post) => (
                      <MediaGridItem
                        key={post.id}
                        post={post}
                        onClick={() => setSelectedPost(post)}
                      />
                    ))}
                  </div>
                  {/* all text posts shown below grid */}
                  {posts.filter((p) => !p.media && p.caption).length > 0 && (
                    <div className="mt-6 space-y-4">
                      <h2 className="text-xs font-semibold uppercase tracking-widest text-(--text-muted)">
                        Text posts
                      </h2>
                      {posts
                        .filter((p) => !p.media && p.caption)
                        .slice(0, 5)
                        .map((post) => (
                          <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                  )}
                </>
              )}
            </section>
          )}
        </>
      )}

      {/* ── Media lightbox ── */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="bg-(--bg-primary) w-full max-w-2xl mx-4 rounded-2xl overflow-hidden border border-(--border-color) modal-in"
            style={{ boxShadow: "var(--shadow-md)", maxHeight: "90vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* media */}
            {selectedPost.media && (
              <div className="bg-black max-h-[60vh] flex items-center justify-center overflow-hidden">
                {selectedPost.media.type === "image" ? (
                  <img src={selectedPost.media.url} alt="" className="w-full max-h-[60vh] object-contain" />
                ) : (
                  <video src={selectedPost.media.url} controls autoPlay className="w-full max-h-[60vh] object-contain" />
                )}
              </div>
            )}
            {/* info */}
            <div className="p-4">
              <div className="flex items-center gap-2.5 mb-2">
                <Avatar name={selectedPost.authorUsername || "User"} src={selectedPost.authorPhoto} size="sm" />
                <div>
                  <p className="text-sm font-semibold text-(--text-primary)">{selectedPost.authorUsername || "User"}</p>
                </div>
              </div>
              {selectedPost.caption && (
                <p className="text-sm text-(--text-primary) leading-relaxed">{selectedPost.caption}</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-xs text-(--text-muted)">
                <span>❤️ {selectedPost.likes.length} likes</span>
                <span>💬 {selectedPost.comments.length} comments</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}