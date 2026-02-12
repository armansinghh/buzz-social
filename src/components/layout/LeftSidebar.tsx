import { NavLink } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faCompass, faUser } from "@fortawesome/free-solid-svg-icons";

export default function LeftSidebar() {
  const { user } = useAuth();

  return (
    <aside className="hidden md:block">
      <nav className="flex flex-col gap-4">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `p-2 rounded ${isActive ? "bg-black text-white" : "hover:bg-gray-100"}`
          }
        >
          {" "}
          <FontAwesomeIcon icon={faHouse} />
          <span className="pl-2">Home</span>
        </NavLink>

        <NavLink
          to="/explore"
          className={({ isActive }) =>
            `p-2 rounded ${isActive ? "bg-black text-white" : "hover:bg-gray-100"}`
          }
        >
          {" "}
          <FontAwesomeIcon icon={faCompass} />
          <span className="pl-2">Explore</span>
        </NavLink>

        {user && (
          <NavLink
            to={`/profile/${user.id}`}
            className={({ isActive }) =>
              `p-2 rounded ${isActive ? "bg-black text-white" : "hover:bg-gray-100"}`
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
