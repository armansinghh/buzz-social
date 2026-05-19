import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { useFollow } from "@/features/follow/FollowContext";
import Avatar from "@/components/ui/Avatar";
import type { UserProfile } from "@/types/user";

export default function PeopleCard({ person }: { person: UserProfile }) {
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