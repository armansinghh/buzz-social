import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { useAuth } from "@/features/auth/AuthContext";
import { usePosts } from "@/features/posts/PostContext";

import Avatar from "@/components/ui/Avatar";
import PostCard from "@/features/posts/PostCard";

type ViewedProfile = {
  username?: string;
  name?: string;
  photoURL?: string;
  followers?: string[];
  following?: string[];
};

export default function Profile() {
  const { id } = useParams();

  const { user, followUser, unfollowUser, isFollowing } = useAuth();

  const { posts } = usePosts();

  const [viewedProfile, setViewedProfile] = useState<ViewedProfile | null>(
    null,
  );

  const [loading, setLoading] = useState(true);

  const isOwnProfile = user?.uid === id;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;

      setLoading(true);

      try {
        const ref = doc(db, "users", id);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setViewedProfile(snap.data() as ViewedProfile);
        } else {
          setViewedProfile(null);
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const handleFollowToggle = async () => {
    if (!id || !user || !viewedProfile) return;

    try {
      if (isFollowing(id)) {
        await unfollowUser(id);

        setViewedProfile((prev) =>
          prev
            ? {
                ...prev,
                followers:
                  prev.followers?.filter(
                    (followerId) => followerId !== user.uid,
                  ) ?? [],
              }
            : prev,
        );
      } else {
        await followUser(id);

        setViewedProfile((prev) =>
          prev
            ? {
                ...prev,
                followers: [...(prev.followers ?? []), user.uid],
              }
            : prev,
        );
      }
    } catch (err) {
      console.error("Follow toggle failed:", err);
    }
  };

  const displayName = viewedProfile?.name || viewedProfile?.username || "User";

  const username =
    viewedProfile?.username || displayName.toLowerCase().replace(/\s+/g, "");

  const bio = "Building something cool 🚀";

  const userPosts = posts.filter((post) => post.authorId === id);

  if (loading) {
    return (
      <div className="text-center py-10 text-(--text-muted)">
        Loading profile...
      </div>
    );
  }

  if (!viewedProfile) {
    return (
      <div className="text-center py-10 text-(--text-muted)">
        User not found.
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6">
        <Avatar
          name={displayName}
          src={viewedProfile.photoURL}
          size="lg"
          className="self-start sm:self-auto"
        />

        <div className="flex flex-col gap-1">
          <h2 className="text-xl sm:text-2xl font-semibold leading-tight">
            {displayName}
          </h2>

          <p className="text-sm text-(--text-muted)">@{username}</p>

          <p className="text-sm mt-1 text-(--text-secondary) max-w-md">{bio}</p>

          {!isOwnProfile && (
            <button
              onClick={handleFollowToggle}
              className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium transition ${
                isFollowing(id!)
                  ? "bg-(--bg-tertiary) text-(--text-primary)"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              {isFollowing(id!) ? "Following" : "Follow"}
            </button>
          )}

          <div className="flex gap-5 mt-3 text-sm sm:hidden">
            <span>
              <span className="font-semibold">{userPosts.length}</span>{" "}
              <span className="text-(--text-muted)">Posts</span>
            </span>
            <span>
              <span className="font-semibold">
                {viewedProfile.followers?.length ?? 0}
              </span>{" "}
              <span className="text-(--text-muted)">Followers</span>
            </span>
            <span>
              <span className="font-semibold">
                {viewedProfile.following?.length ?? 0}
              </span>{" "}
              <span className="text-(--text-muted)">Following</span>
            </span>
          </div>
        </div>
      </div>

      <div className="hidden sm:flex gap-8 text-sm mt-6">
        <div>
          <span className="font-semibold">{userPosts.length}</span>{" "}
          <span className="text-(--text-muted)">Posts</span>
        </div>
        <div>
          <span className="font-semibold">
            {viewedProfile.followers?.length ?? 0}
          </span>{" "}
          <span className="text-(--text-muted)">Followers</span>
        </div>
        <div>
          <span className="font-semibold">
            {viewedProfile.following?.length ?? 0}
          </span>{" "}
          <span className="text-(--text-muted)">Following</span>
        </div>
      </div>

      <div className="border-t border-(--border-color) mt-6" />

      <div className="flex flex-col gap-6 mt-6">
        <h3 className="text-sm font-semibold text-(--text-muted) tracking-wide">
          POSTS
        </h3>

        {userPosts.length === 0 ? (
          <div className="text-sm text-(--text-muted) text-center py-10">
            No posts yet.
          </div>
        ) : (
          userPosts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
}
