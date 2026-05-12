import { NavLink } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { useUI } from "@/contexts/UIContext";
import {
  FaHouse,
  FaCompass,
  FaUser,
  FaPlus,
  FaHeart,
  FaMagnifyingGlass,
} from "react-icons/fa6";
import { useNotifications } from "@/features/notifications/NotificationContext";

export default function LeftSidebar() {
  const { user, profile } = useAuth();
  const { openModal } = useUI();
  const { unreadCount } = useNotifications();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
    ${
      isActive
        ? "bg-[var(--accent)] text-[var(--bg-primary)]"
        : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
    }`;

  const btnClass =
    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] w-full text-left";

  return (
    <aside className="hidden md:flex flex-col gap-1 pt-2">
      <NavLink to="/" className={navLinkClass}>
        <FaHouse className="w-4 h-4" />
        <span>Home</span>
      </NavLink>

      <NavLink to="/explore" className={navLinkClass}>
        <FaCompass className="w-4 h-4" />
        <span>Explore</span>
      </NavLink>

      <NavLink to="/search" className={navLinkClass}>
        <FaMagnifyingGlass className="w-4 h-4" />
        <span>Search</span>
      </NavLink>

      <button onClick={() => openModal("notifications")} className={btnClass}>
        <div className="relative">
          <FaHeart className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
        <span>Notifications</span>
      </button>

      <button
        onClick={() => openModal("createPost")}
        className={`${btnClass}`}
      >
        <FaPlus className="w-4 h-4" />
        <span>Create Post</span>
      </button>

      {user && (
        <NavLink
          to={`/profile/${profile?.username || "User"}`}
          className={navLinkClass}
        >
          <FaUser className="w-4 h-4" />
          <span>Profile</span>
        </NavLink>
      )}
    </aside>
  );
}
