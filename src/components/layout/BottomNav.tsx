import { NavLink } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { useUI } from "@/features/ui/UIContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faCompass,
  faPlus,
  faHeart,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { useNotifications } from "@/features/notifications/NotificationContext";

export default function BottomNav() {
  const { user } = useAuth();
  const { openModal } = useUI();
  const { unreadCount } = useNotifications();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors flex-1 py-2
    ${isActive ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center
      bg-[var(--bg-primary)] border-t border-[var(--border-color)]
      pb-safe"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <NavLink to="/" className={linkClass}>
        <FontAwesomeIcon icon={faHouse} className="w-5 h-5" />
        <span>Home</span>
      </NavLink>

      <NavLink to="/explore" className={linkClass}>
        <FontAwesomeIcon icon={faCompass} className="w-5 h-5" />
        <span>Explore</span>
      </NavLink>

      <button
        onClick={() => openModal("createPost")}
        className="flex flex-col items-center justify-center gap-1 text-xs font-medium flex-1 py-2"
      >
        <div className="w-9 h-9 rounded-xl bg-[var(--accent)] text-[var(--bg-primary)] flex items-center justify-center">
          <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
        </div>
      </button>

      <button
        onClick={() => openModal("notifications")}
        className="relative flex flex-col items-center justify-center gap-1 text-xs font-medium flex-1 py-2 text-[var(--text-muted)]"
      >
        <div className="relative">
          <FontAwesomeIcon icon={faHeart} className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
        <span>Activity</span>
      </button>

      {user ? (
        <NavLink to={`/profile/${user.id}`} className={linkClass}>
          <FontAwesomeIcon icon={faUser} className="w-5 h-5" />
          <span>Profile</span>
        </NavLink>
      ) : (
        <NavLink to="/login" className={linkClass}>
          <FontAwesomeIcon icon={faUser} className="w-5 h-5" />
          <span>Login</span>
        </NavLink>
      )}
    </nav>
  );
}