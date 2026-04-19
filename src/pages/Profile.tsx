import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/features/auth/AuthContext";
import { usePosts } from "@/features/posts/PostContext";
import { useFollow } from "@/features/follow/FollowContext";
import type { UserProfile } from "@/types/user";
import PostCard from "@/features/posts/components/PostCard";
import Avatar from "@/components/ui/Avatar";

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const { user, profile: currentUserProfile } = useAuth();
  const { posts } = usePosts();
  const { followUser, unfollowUser, isFollowing, getFollowerCount, getFollowingCount } = useFollow();

  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const isOwnProfile =
    user &&
    (user.uid === id || currentUserProfile?.username === id);

  const followed = profileData ? isFollowing(profileData.uid) : false;

  const handleFollowToggle = () => {
    if (!profileData) return;
    if (followed) {
      unfollowUser(profileData.uid);
    } else {
      followUser(profileData.uid);
    }
  };

  useEffect(() => {
    if (!id) return;

    const fetchProfile = async () => {
      setLoading(true);
      setNotFound(false);

      try {
        // Try matching by username first
        const usernameQuery = query(
          collection(db, "users"),
          where("username", "==", id)
        );
        const usernameSnap = await getDocs(usernameQuery);

        if (!usernameSnap.empty) {
          const docData = usernameSnap.docs[0].data() as UserProfile;
          setProfileData({ ...docData, uid: usernameSnap.docs[0].id });
          setLoading(false);
          return;
        }

        // Fall back to matching by uid
        const uidQuery = query(
          collection(db, "users"),
          where("uid", "==", id)
        );
        const uidSnap = await getDocs(uidQuery);

        if (!uidSnap.empty) {
          const docData = uidSnap.docs[0].data() as UserProfile;
          setProfileData({ ...docData, uid: uidSnap.docs[0].id });
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const userPosts = posts.filter(
    (p) =>
      p.authorId === profileData?.uid ||
      p.authorId === profileData?.username
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-(--bg-primary) rounded-2xl border border-(--border-color) p-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full skeleton" />
            <div className="space-y-2 flex-1">
              <div className="h-5 w-32 rounded-lg skeleton" />
              <div className="h-4 w-24 rounded-lg skeleton" />
            </div>
          </div>
        </div>
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

  if (notFound || !profileData) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-(--text-muted)">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-40"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <p className="text-base font-medium text-(--text-secondary)">
          User not found
        </p>
        <p className="text-sm">
          No account matches <span className="font-mono">@{id}</span>
        </p>
      </div>
    );
  }

  const displayName =
    profileData.username || profileData.name || "User";

  const followerCount = getFollowerCount(profileData.uid);
  const followingCount = isOwnProfile ? getFollowingCount() : 0;

  return (
    <div className="space-y-6">
      {/* Profile header card */}
      <div
        className="bg-(--bg-primary) rounded-2xl border border-(--border-color) overflow-hidden"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        {/* Banner */}
        <div className="h-24 bg-(--bg-tertiary)" />

        <div className="px-5 pb-5">
          {/* Avatar + action button row */}
          <div className="flex items-end justify-between -mt-10 mb-4">
            <Avatar
              name={displayName}
              src={profileData.avatar}
              size="lg"
              className="ring-4 ring-(--bg-primary)"
            />

            {isOwnProfile ? (
              <button className="px-4 py-1.5 text-sm font-medium rounded-xl border border-(--border-color) text-(--text-secondary) hover:bg-(--bg-tertiary) hover:text-(--text-primary) transition-colors">
                Edit profile
              </button>
            ) : (
              <button
                onClick={handleFollowToggle}
                className={`px-4 py-1.5 text-sm font-semibold rounded-xl transition-all
                  ${
                    followed
                      ? "border border-(--border-color) text-(--text-secondary) hover:border-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                      : "bg-(--accent) text-(--bg-primary) hover:opacity-90"
                  }`}
              >
                {followed ? "Following" : "Follow"}
              </button>
            )}
          </div>

          {/* Info */}
          <div className="space-y-1">
            <h1 className="text-lg font-bold text-(--text-primary) leading-tight">
              {profileData.name || displayName}
            </h1>
            {profileData.username && (
              <p className="text-sm text-(--text-muted)">@{profileData.username}</p>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-5 mt-4 text-sm">
            <div>
              <span className="font-bold text-(--text-primary)">{userPosts.length}</span>{" "}
              <span className="text-(--text-muted)">{userPosts.length === 1 ? "post" : "posts"}</span>
            </div>
            <div>
              <span className="font-bold text-(--text-primary)">{followerCount}</span>{" "}
              <span className="text-(--text-muted)">followers</span>
            </div>
            {isOwnProfile && (
              <div>
                <span className="font-bold text-(--text-primary)">{followingCount}</span>{" "}
                <span className="text-(--text-muted)">following</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Posts */}
      {userPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-(--text-muted)">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-40"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <p className="text-sm">No posts yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {userPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}