import { NavLink } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { useUI } from "@/features/ui/UIContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faCompass,
  faUser,
  faAdd,
  faHeart,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { useNotifications } from "@/features/notifications/NotificationContext";

export default function LeftSidebar() {
  const { user } = useAuth();
  const { openModal } = useUI();
  const { unreadCount } = useNotifications();

  return (
    <aside className="hidden md:block">
      <nav className="flex flex-col gap-4">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `p-2 rounded ${
              isActive ? "bg-black text-white" : "hover:bg-gray-100"
            }`
          }
        >
          <FontAwesomeIcon icon={faHouse} />
          <span className="pl-2">Home</span>
        </NavLink>

        <NavLink
          to="/explore"
          className={({ isActive }) =>
            `p-2 rounded ${
              isActive ? "bg-black text-white" : "hover:bg-gray-100"
            }`
          }
        >
          <FontAwesomeIcon icon={faCompass} />
          <span className="pl-2">Explore</span>
        </NavLink>

        <NavLink
          to="/search"
          className={({ isActive }) =>
            `p-2 rounded ${
              isActive ? "bg-black text-white" : "hover:bg-gray-100"
            }`
          }
        >
          <FontAwesomeIcon icon={faMagnifyingGlass} />
          <span className="pl-2">Search</span>
        </NavLink>

        <button
          onClick={() => openModal("notifications")}
          className="p-2 rounded hover:bg-gray-100 flex items-center w-full text-left"
        >
          <div className="relative">
            <FontAwesomeIcon icon={faHeart} />

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </div>

          <span className="pl-2">Notifications</span>
        </button>

        <button
          onClick={() => openModal("createPost")}
          className="p-2 rounded hover:bg-gray-100 flex items-center w-full text-left"
        >
          <FontAwesomeIcon icon={faAdd} />
          <span className="pl-2">Create</span>
        </button>

        {user && (
          <NavLink
            to={`/profile/${user.id}`}
            className={({ isActive }) =>
              `p-2 rounded ${
                isActive ? "bg-black text-white" : "hover:bg-gray-100"
              }`
            }
          >
            <FontAwesomeIcon icon={faUser} />
            <span className="pl-2">Profile</span>
          </NavLink>
        )}
      </nav>
    </aside>
  );
}
