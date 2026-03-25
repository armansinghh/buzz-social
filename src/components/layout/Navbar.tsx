import { useAuth } from "@/features/auth/AuthContext";
import { useUI } from "@/features/ui/UIContext";
import { Link, useNavigate } from "react-router-dom";
import Avatar from "@/components/ui/Avatar";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { toggleTheme, theme } = useUI();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="h-14 w-full flex justify-between items-center px-6 bg-[var(--bg-primary)] border-b border-[var(--border-color)]">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 group">
        <span className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
          buzz
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 group-hover:scale-125 transition-transform" />
      </Link>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          title={theme === "dark" ? "Switch to light" : "Switch to dark"}
        >
          {theme === "dark" ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>

        {user ? (
          <div className="flex items-center gap-3">
            <Avatar name={user.name} size="sm" />
            <span className="text-sm text-[var(--text-secondary)] hidden sm:block font-medium">
              {user.name}
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-sm rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="px-4 py-1.5 text-sm rounded-lg bg-[var(--accent)] text-[var(--bg-primary)] hover:opacity-90 transition-opacity font-medium"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}