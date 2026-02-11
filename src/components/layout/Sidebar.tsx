import { NavLink } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="w-64 border-r p-4 hidden md:block">
      <nav className="flex flex-col gap-3">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `p-2 rounded ${isActive ? "bg-black text-white" : "hover:bg-gray-100"}`
          }
        >
          Home
        </NavLink>

        <NavLink
          to="/explore"
          className={({ isActive }) =>
            `p-2 rounded ${isActive ? "bg-black text-white" : "hover:bg-gray-100"}`
          }
        >
          Explore
        </NavLink>

        {user && (
          <NavLink
            to={`/profile/${user.id}`}
            className={({ isActive }) =>
              `p-2 rounded ${isActive ? "bg-black text-white" : "hover:bg-gray-100"}`
            }
          >
            Profile
          </NavLink>
        )}
      </nav>
    </aside>
  );
}
