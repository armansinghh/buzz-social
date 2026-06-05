import { useAuth } from "@/features/auth/AuthContext";
import { useUI } from "@/contexts/UIContext";
import { Link, useNavigate } from "react-router-dom";
import Avatar from "@/components/ui/Avatar";

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const { toggleTheme, theme } = useUI();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <nav className="sticky top-0 z-40 h-16 w-full flex justify-between items-center px-4 sm:px-6 bg-(--bg-primary) border-b border-(--border-color)">
      {/* The Classic Logo is back */}
      <Link
        to="/"
        className="flex items-center gap-1.5 group rounded-md"
      >
        <span className="text-xl font-extrabold text-(--text-primary)">
          buzz
        </span>
        <span className="w-2 h-2 rounded-full bg-amber-400 group-hover:scale-125 transition-transform" />
      </Link>

      {/* Right side */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-(--bg-secondary) transition-colors text-(--text-secondary) hover:text-(--text-primary)"
          title={theme === "dark" ? "Switch to light" : "Switch to dark"}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        {/* Separator */}
        <div className="w-px h-5 bg-(--border-color) hidden sm:block mx-1" />

        {user ? (
          <div className="flex items-center gap-3 sm:gap-4">
            {/* User Profile Link */}
            <Link
              to={`/profile/${profile?.username}`}
              className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
              title="Go to profile"
            >
              <Avatar
                name={profile?.username ?? "User"}
                src={profile?.avatar}
                size="sm"
              />
              <span className="hidden sm:block text-sm font-medium text-(--text-primary)">
                {profile?.username}
              </span>
            </Link>

            <button
              onClick={handleLogout}
              className="px-4 py-1.5 text-sm rounded-full border border-(--border-color) text-(--text-secondary) hover:bg-(--bg-secondary) hover:text-(--text-primary) transition-all font-medium"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            to="/Auth"
            className="px-5 py-2 text-sm rounded-full bg-(--text-primary) text-(--bg-primary) hover:scale-105 active:scale-95 transition-all font-semibold shadow-sm ml-1"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
