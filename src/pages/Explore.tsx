import { useState, useEffect, useCallback } from "react";
import {
  collection,
  getDocs,
  query,
  limit,
  startAfter,
} from "firebase/firestore";
import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "@/lib/firebase";
import { useAuth } from "@/features/auth/AuthContext";
import { useFollow } from "@/features/follow/FollowContext";
import { usePosts } from "@/features/posts/PostContext";
import PostCard from "@/features/posts/components/PostCard";
import Avatar from "@/components/ui/Avatar";
import type { Post } from "@/features/posts/posts.types";
import Tabs from "@/components/ui/Tabs";

// ─── Constants ────────────────────────────────────────────────────────────────
const USERS_LIMIT = 20;
const SESSION_TAB_KEY = "buzz-explore-tab";

type ExploreTab = "trending" | "people" | "media";

type UserProfile = {
  uid: string;
  username?: string;
  name?: string;
  avatar?: string;
  email?: string;
};

// ─── Time-decay trending score (Hacker News gravity) ─────────────────────────
function trendingScore(post: Post): number {
  const ageHours =
    (Date.now() - new Date(post.createdAt).getTime()) / 3_600_000;
  return post.likes.length / Math.pow(ageHours + 2, 1.5);
}

// ─── Word-boundary safe hashtag extraction ────────────────────────────────────
function extractHashtags(posts: Post[]): { tag: string; count: number }[] {
  const counts: Record<string, number> = {};
  posts.forEach((p) => {
    const matches = p.caption.match(/(?<![a-zA-Z0-9_])#[a-zA-Z]\w*/g) ?? [];
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

// ─── Proper whole-token hashtag post filter ───────────────────────────────────
function postMatchesTag(post: Post, tag: string): boolean {
  const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `(?<![a-zA-Z0-9_])${escaped}(?![a-zA-Z0-9_])`,
    "i",
  );
  return pattern.test(post.caption);
}

// ─────────────────────────────────────────────────────────────────────────────
// TrendingTag
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// PeopleCard
// ─────────────────────────────────────────────────────────────────────────────
function PeopleCard({ person }: { person: UserProfile }) {
  const { user } = useAuth();
  const { followUser, unfollowUser, isFollowing } = useFollow();
  const navigate = useNavigate();

  const followed = isFollowing(person.uid);
  const isOwn = user?.uid === person.uid;
  const displayName = person.name || person.username || "User";

  const goToProfile = () =>
    navigate(`/profile/${person.username || person.uid}`);

  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    followed ? unfollowUser(person.uid) : followUser(person.uid);
  };

  return (
    <div
      onClick={goToProfile}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && goToProfile()}
      className="flex items-center gap-3 p-4 bg-(--bg-primary) rounded-2xl border border-(--border-color) hover:border-(--text-muted) transition-all cursor-pointer"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      <Avatar name={displayName} src={person.avatar} size="md" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-(--text-primary) truncate">
          {displayName}
        </p>
        {person.username && (
          <p className="text-xs text-(--text-muted) truncate">
            @{person.username}
          </p>
        )}
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

// ─────────────────────────────────────────────────────────────────────────────
// MediaGridItem
// ─────────────────────────────────────────────────────────────────────────────
function MediaGridItem({ post, onClick }: { post: Post; onClick: () => void }) {
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
        <div className="w-full h-full flex items-center justify-center p-3">
          <p className="text-xs text-(--text-secondary) text-center line-clamp-4 leading-relaxed">
            {post.caption}
          </p>
        </div>
      )}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-colors flex items-end p-2 opacity-0 group-hover:opacity-100">
        <div className="flex items-center gap-2 text-white text-xs font-semibold drop-shadow">
          <span>❤️ {post.likes.length}</span>
          <span>💬 {post.comments.length}</span>
        </div>
      </div>
      {post.media?.type === "video" && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </div>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MediaLightbox with prev/next + keyboard arrows
// ─────────────────────────────────────────────────────────────────────────────
function MediaLightbox({
  post,
  mediaPosts,
  onClose,
  onNavigate,
}: {
  post: Post;
  mediaPosts: Post[];
  onClose: () => void;
  onNavigate: (p: Post) => void;
}) {
  const idx = mediaPosts.findIndex((p) => p.id === post.id);
  const hasPrev = idx > 0;
  const hasNext = idx < mediaPosts.length - 1;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onNavigate(mediaPosts[idx - 1]);
      if (e.key === "ArrowRight" && hasNext) onNavigate(mediaPosts[idx + 1]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, hasPrev, hasNext, onClose, onNavigate, mediaPosts]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-(--bg-primary) w-full max-w-2xl mx-4 rounded-2xl overflow-hidden border border-(--border-color) modal-in"
        style={{ boxShadow: "var(--shadow-md)", maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {post.media && (
          <div className="relative bg-black max-h-[60vh] flex items-center justify-center overflow-hidden">
            {post.media.type === "image" ? (
              <img
                src={post.media.url}
                alt=""
                className="w-full max-h-[60vh] object-contain"
              />
            ) : (
              <video
                src={post.media.url}
                controls
                autoPlay
                className="w-full max-h-[60vh] object-contain"
              />
            )}
            {hasPrev && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate(mediaPosts[idx - 1]);
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                aria-label="Previous"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            )}
            {hasNext && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate(mediaPosts[idx + 1]);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                aria-label="Next"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            )}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-black/50 rounded-full text-white text-xs font-medium">
              {idx + 1} / {mediaPosts.length}
            </div>
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-4">
          <div className="flex items-center gap-2.5 mb-2">
            <Avatar
              name={post.authorUsername || "User"}
              src={post.authorPhoto}
              size="sm"
            />
            <p className="text-sm font-semibold text-(--text-primary)">
              {post.authorUsername || "User"}
            </p>
          </div>
          {post.caption && (
            <p className="text-sm text-(--text-primary) leading-relaxed">
              {post.caption}
            </p>
          )}
          <div className="flex items-center gap-4 mt-3 text-xs text-(--text-muted)">
            <span>❤️ {post.likes.length} likes</span>
            <span>💬 {post.comments.length} comments</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeletons
// ─────────────────────────────────────────────────────────────────────────────
function PeopleSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-4 bg-(--bg-primary) rounded-2xl border border-(--border-color)"
        >
          <div className="w-10 h-10 rounded-full skeleton shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-28 rounded skeleton" />
            <div className="h-3 w-20 rounded skeleton" />
          </div>
          <div className="h-7 w-16 rounded-lg skeleton shrink-0" />
        </div>
      ))}
    </div>
  );
}

function PostSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="bg-(--bg-primary) rounded-2xl border border-(--border-color) p-4 space-y-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full skeleton" />
            <div className="h-4 w-28 rounded skeleton" />
          </div>
          <div className="h-40 rounded-xl skeleton" />
        </div>
      ))}
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="aspect-square rounded-xl skeleton" />
      ))}
    </div>
  );
}

function EmptyState({
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

const PeopleEmptyIcon = (
  <svg
    width="40"
    height="40"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const MediaEmptyIcon = (
  <svg
    width="40"
    height="40"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);
const TrendEmptyIcon = (
  <svg
    width="40"
    height="40"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main Explore page
// ─────────────────────────────────────────────────────────────────────────────
export default function Explore() {
  // ── Use live posts from context (same as Home & Profile) ─────────────────
  const { posts, hasMore: hasMoreExplorePosts, loadMorePosts } = usePosts();

  // ── Tab state (persisted in sessionStorage) ───────────────────────────────
  const [activeTab, setActiveTab] = useState<ExploreTab>(() => {
    const saved = sessionStorage.getItem(SESSION_TAB_KEY);
    return (saved as ExploreTab) || "trending";
  });

  const handleTabChange = (tab: ExploreTab) => {
    setActiveTab(tab);
    sessionStorage.setItem(SESSION_TAB_KEY, tab);
  };

  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [loadingMoreExplorePosts, setLoadingMoreExplorePosts] = useState(false);

  // ── Users (lazy-loaded on People tab) ────────────────────────────────────
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const [lastUserDoc, setLastUserDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loadingMoreUsers, setLoadingMoreUsers] = useState(false);

  // Lightbox
  const [lightboxPost, setLightboxPost] = useState<Post | null>(null);

  // ── Load more posts via context ───────────────────────────────────────────
  const loadMoreExplorePosts = async () => {
    if (!hasMoreExplorePosts || loadingMoreExplorePosts) return;
    setLoadingMoreExplorePosts(true);
    try {
      await loadMorePosts();
    } finally {
      setLoadingMoreExplorePosts(false);
    }
  };

  // ── Load users lazily when People tab opens ───────────────────────────────
  const loadUsers = useCallback(async () => {
    if (usersLoaded) return;
    setUsersLoading(true);
    try {
      const q = query(collection(db, "users"), limit(USERS_LIMIT));
      const snap = await getDocs(q);
      const fetched = snap.docs.map((d) => ({
        ...(d.data() as UserProfile),
        uid: d.id,
      }));
      setUsers(fetched);
      setLastUserDoc(snap.docs[snap.docs.length - 1] ?? null);
      setHasMoreUsers(snap.docs.length === USERS_LIMIT);
      setUsersLoaded(true);
    } catch (err) {
      console.error("Users fetch failed:", err);
    } finally {
      setUsersLoading(false);
    }
  }, [usersLoaded]);

  const loadMoreUsers = async () => {
    if (!lastUserDoc || !hasMoreUsers || loadingMoreUsers) return;
    setLoadingMoreUsers(true);
    try {
      const q = query(
        collection(db, "users"),
        startAfter(lastUserDoc),
        limit(USERS_LIMIT),
      );
      const snap = await getDocs(q);
      const fetched = snap.docs.map((d) => ({
        ...(d.data() as UserProfile),
        uid: d.id,
      }));
      setUsers((prev) => [...prev, ...fetched]);
      setLastUserDoc(snap.docs[snap.docs.length - 1] ?? null);
      setHasMoreUsers(snap.docs.length === USERS_LIMIT);
    } finally {
      setLoadingMoreUsers(false);
    }
  };

  useEffect(() => {
    if (activeTab === "people") loadUsers();
  }, [activeTab, loadUsers]);

  // ── Derived data (from live context posts) ────────────────────────────────
  const trendingPosts = activeTag
    ? [...posts]
        .sort((a, b) => trendingScore(b) - trendingScore(a))
        .filter((p) => postMatchesTag(p, activeTag))
    : [...posts].sort((a, b) => trendingScore(b) - trendingScore(a));

  const hashtags = extractHashtags(posts);
  const mediaPosts = posts.filter((p) => p.media);

  // ── Tab definitions ───────────────────────────────────────────────────────
  const tabs: { id: ExploreTab; label: string; icon: React.ReactNode }[] = [
    {
      id: "trending",
      label: "Trending",
      icon: (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      ),
    },
    {
      id: "people",
      label: "People",
      icon: (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
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
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      ),
    },
  ];

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(key) => handleTabChange(key as ExploreTab)}
      />

      {/* ── Trending ─────────────────────────────────────────────────── */}
      {activeTab === "trending" && (
        <div className="space-y-5">
          {hashtags.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-(--text-muted) mb-3 flex items-center gap-2">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="4" y1="9" x2="20" y2="9" />
                  <line x1="4" y1="15" x2="20" y2="15" />
                  <line x1="10" y1="3" x2="8" y2="21" />
                  <line x1="16" y1="3" x2="14" y2="21" />
                </svg>
                Topics
              </h2>
              <div
                className="bg-(--bg-primary) rounded-2xl border border-(--border-color) divide-y divide-(--border-color) overflow-hidden"
                style={{ boxShadow: "var(--shadow-sm)" }}
              >
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

          {activeTag && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-(--text-muted)">
                Showing posts for
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-(--accent) text-(--bg-primary) text-xs font-semibold rounded-full">
                {activeTag}
                <button
                  onClick={() => setActiveTag(null)}
                  className="opacity-70 hover:opacity-100"
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
              </span>
            </div>
          )}

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-(--text-muted) mb-3 flex items-center gap-2">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
              {activeTag ? "Matching posts" : "Trending now"}
            </h2>

            {posts.length === 0 ? (
              activeTag ? (
                <EmptyState
                  icon={TrendEmptyIcon}
                  title={`No posts tagged ${activeTag}`}
                  subtitle="Try a different topic above"
                />
              ) : (
                <PostSkeleton />
              )
            ) : trendingPosts.length === 0 ? (
              <EmptyState
                icon={TrendEmptyIcon}
                title="Nothing trending yet"
                subtitle="Be the first to post something!"
              />
            ) : (
              <>
                <div className="space-y-4">
                  {trendingPosts.map((p) => (
                    <PostCard key={p.id} post={p} />
                  ))}
                </div>
                {!activeTag && hasMoreExplorePosts && (
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={loadMoreExplorePosts}
                      disabled={loadingMoreExplorePosts}
                      className="px-5 py-2 rounded-xl bg-(--bg-primary) border border-(--border-color) text-sm hover:bg-(--bg-secondary) transition"
                    >
                      {loadingMoreExplorePosts ? "Loading…" : "Load more"}
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      )}

      {/* ── People ───────────────────────────────────────────────────── */}
      {activeTab === "people" && (
        <section className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-(--text-muted) mb-3">
            People on Buzz
          </h2>
          {usersLoading ? (
            <PeopleSkeleton />
          ) : users.length === 0 ? (
            <EmptyState
              icon={PeopleEmptyIcon}
              title="No users found"
              subtitle="Invite your friends to join Buzz!"
            />
          ) : (
            <>
              {users.map((u) => (
                <PeopleCard key={u.uid} person={u} />
              ))}
              {hasMoreUsers && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={loadMoreUsers}
                    disabled={loadingMoreUsers}
                    className="px-5 py-2 rounded-xl bg-(--bg-primary) border border-(--border-color) text-sm hover:bg-(--bg-secondary) transition"
                  >
                    {loadingMoreUsers ? "Loading…" : "Load more"}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* ── Media ────────────────────────────────────────────────────── */}
      {activeTab === "media" && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-(--text-muted) mb-3">
            {posts.length === 0
              ? "Loading…"
              : `${mediaPosts.length} ${mediaPosts.length === 1 ? "photo / video" : "photos & videos"}`}
          </h2>
          {posts.length === 0 ? (
            <GridSkeleton />
          ) : mediaPosts.length === 0 ? (
            <EmptyState
              icon={MediaEmptyIcon}
              title="No media posts yet"
              subtitle="Posts with photos or videos will appear here"
            />
          ) : (
            <>
              <div className="grid grid-cols-3 gap-1.5">
                {mediaPosts.map((p) => (
                  <MediaGridItem
                    key={p.id}
                    post={p}
                    onClick={() => setLightboxPost(p)}
                  />
                ))}
              </div>
              {hasMoreExplorePosts && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={loadMoreExplorePosts}
                    disabled={loadingMoreExplorePosts}
                    className="px-5 py-2 rounded-xl bg-(--bg-primary) border border-(--border-color) text-sm hover:bg-(--bg-secondary) transition"
                  >
                    {loadingMoreExplorePosts ? "Loading…" : "Load more"}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* Lightbox with prev/next + keyboard */}
      {lightboxPost && (
        <MediaLightbox
          post={lightboxPost}
          mediaPosts={mediaPosts}
          onClose={() => setLightboxPost(null)}
          onNavigate={setLightboxPost}
        />
      )}
    </div>
  );
}
