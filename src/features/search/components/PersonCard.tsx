import { useNavigate } from "react-router-dom";
import Avatar from "@/components/ui/Avatar";
import { useAuth } from "@/features/auth/AuthContext";
import { useFollow } from "@/features/follow/FollowContext";
import { highlightText } from "../utils/searchUtils";
import type { SearchUser } from "../hooks/useSearchData";

export default function PersonCard({ person, query }: { person: SearchUser; query: string }) {
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