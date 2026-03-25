import { NavLink } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { useUI } from "@/features/ui/UIContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faCompass,
  faUser,
  faPlus,
  faHeart,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { useNotifications } from "@/features/notifications/NotificationContext";

export default function LeftSidebar() {
  const { user } = useAuth();
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
        <FontAwesomeIcon icon={faHouse} className="w-4 h-4" />
        <span>Home</span>
      </NavLink>

      <NavLink to="/explore" className={navLinkClass}>
        <FontAwesomeIcon icon={faCompass} className="w-4 h-4" />
        <span>Explore</span>
      </NavLink>

      <NavLink to="/search" className={navLinkClass}>
        <FontAwesomeIcon icon={faMagnifyingGlass} className="w-4 h-4" />
        <span>Search</span>
      </NavLink>

      <button
        onClick={() => openModal("notifications")}
        className={btnClass}
      >
        <div className="relative">
          <FontAwesomeIcon icon={faHeart} className="w-4 h-4" />
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
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
          bg-[var(--bg-primary)] text-[var(--text-primary)] hover:opacity-90 w-full text-left mt-2"
      >
        <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
        <span>Create Post</span>
      </button>

      {user && (
        <NavLink
          to={`/profile/${user.id}`}
          className={navLinkClass}
        >
          <FontAwesomeIcon icon={faUser} className="w-4 h-4" />
          <span>Profile</span>
        </NavLink>
      )}
    </aside>
  );
}