import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/features/auth/AuthContext";
import { usePosts } from "@/features/posts/PostContext";
import { useFollow } from "@/features/follow/FollowContext";
import { useToast } from "@/contexts/ToastContext";
import type { UserProfile } from "@/types/user";
import PostCard from "@/features/posts/components/PostCard";
import Avatar from "@/components/ui/Avatar";
import EditProfileModal from "@/features/profile/components/EditProfileModal";
import ProfileSkeleton from "@/components/skeletons/ProfileSkeleton";

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const { user, profile: currentUserProfile } = useAuth();
  const { posts } = usePosts();
  const {
    followUser,
    unfollowUser,
    isFollowing,
    getFollowerCount,
    getFollowingCount,
  } = useFollow();
  const { showToast } = useToast();

  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const isOwnProfile =
    user && (user.uid === id || currentUserProfile?.username === id);

  const followed = profileData ? isFollowing(profileData.uid) : false;
  const location = useLocation();

  const handleFollowToggle = () => {
    if (!profileData) return;
    if (followed) {
      unfollowUser(profileData.uid);
    } else {
      followUser(profileData.uid);
    }
  };

  const fetchProfile = async () => {
    if (!id) return;
    setLoading(true);
    setNotFound(false);

    try {
      // FIX 1: Check for instant data from React Router navigation
      if (
        location.state?.preloadedProfile &&
        location.state.preloadedProfile.username === id
      ) {
        setProfileData(location.state.preloadedProfile);
        setLoading(false);
        return;
      }

      // FIX 2: If we are viewing our OWN profile, bypass the search index entirely!
      // This guarantees we get the freshest data immediately after an edit,
      // even if the username didn't change and location.state wasn't used.
      if (user && (id === currentUserProfile?.username || id === user.uid)) {
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          setProfileData({
            ...userSnap.data(),
            uid: userSnap.id,
          } as UserProfile);
          setLoading(false);
          return;
        }
      }

      // 3. Fallback to original queries for viewing OTHER users' profiles
      const usernameQuery = query(
        collection(db, "users"),
        where("username", "==", id),
      );
      const usernameSnap = await getDocs(usernameQuery);

      if (!usernameSnap.empty) {
        const docData = usernameSnap.docs[0].data() as UserProfile;
        setProfileData({ ...docData, uid: usernameSnap.docs[0].id });
        setLoading(false);
        return;
      }

      const uidQuery = query(collection(db, "users"), where("uid", "==", id));
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

  useEffect(() => {
    fetchProfile();
  }, [id]);

  // Re-fetch profile data after edit so the page reflects the latest saved values
  const handleProfileSaved = async () => {
    showToast("Profile updated!", "success");
    await fetchProfile();
  };

  const userPosts = posts.filter(
    (p) =>
      p.authorId === profileData?.uid || p.authorId === profileData?.username,
  );

  if (loading) return <ProfileSkeleton />;

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

  const displayName = profileData.name || profileData.username || "User";
  const followerCount = getFollowerCount(profileData.uid);
  const followingCount = isOwnProfile ? getFollowingCount() : 0;

  return (
    <>
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
                <button
                  onClick={() => setEditModalOpen(true)}
                  className="px-4 py-1.5 text-sm font-medium rounded-xl bg-(--bg-secondary) border border-(--border-color) text-(--text-secondary) hover:bg-(--bg-tertiary) hover:text-(--text-primary) transition-colors"
                >
                  Edit profile
                </button>
              ) : (
                <button
                  onClick={handleFollowToggle}
                  className={`px-4 py-1.5 text-sm font-semibold rounded-xl transition-all
                    ${
                      followed
                        ? "bg-(--bg-secondary) border border-(--border-color) text-(--text-secondary) hover:border-red-400 hover:text-red-500 hover:bg-(--bg-tertiary)"
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
                <p className="text-sm text-(--text-muted)">
                  @{profileData.username}
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-5 mt-4 text-sm">
              <div>
                <span className="font-bold text-(--text-primary)">
                  {userPosts.length}
                </span>{" "}
                <span className="text-(--text-muted)">
                  {userPosts.length === 1 ? "post" : "posts"}
                </span>
              </div>
              <div>
                <span className="font-bold text-(--text-primary)">
                  {followerCount}
                </span>{" "}
                <span className="text-(--text-muted)">followers</span>
              </div>
              {isOwnProfile && (
                <div>
                  <span className="font-bold text-(--text-primary)">
                    {followingCount}
                  </span>{" "}
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

      {/* Edit Profile Modal — rendered outside the card so z-index is clean */}
      <EditProfileModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSaved={handleProfileSaved}
      />
    </>
  );
}
