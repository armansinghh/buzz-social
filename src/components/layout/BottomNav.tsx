"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/AuthContext";
import { useUI } from "@/contexts/UIContext";
import {
  FaHouse,
  FaCompass,
  FaPlus,
  FaHeart,
  FaUser,
} from "react-icons/fa6";
import { useNotifications } from "@/features/notifications/NotificationContext";

export default function BottomNav() {
  const { user, profile } = useAuth();
  const { openModal } = useUI();
  const { unreadCount } = useNotifications();
  const pathname = usePathname();

  const linkClass = (href: string) =>
    `flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors flex-1 py-2
    ${pathname === href ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center
      bg-(--bg-primary) border-t border-(--border-color)
      pb-safe"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <Link href="/" className={linkClass("/")}>
        <FaHouse className="w-5 h-5" />
        <span>Home</span>
      </Link>

      <Link href="/explore" className={linkClass("/explore")}>
        <FaCompass className="w-5 h-5" />
        <span>Explore</span>
      </Link>

      <button
        onClick={() => openModal("createPost")}
        className="flex flex-col items-center justify-center gap-1 text-xs font-medium flex-1 py-2"
      >
        <div className="w-9 h-9 rounded-xl bg-(--accent) text-(--bg-primary) flex items-center justify-center">
          <FaPlus className="w-4 h-4" />
        </div>
      </button>

      <button
        onClick={() => openModal("notifications")}
        className={linkClass("/notifications")}
      >
        <div className="relative">
          <FaHeart className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
        <span>Activity</span>
      </button>

      {user ? (
        <Link href={`/profile/${profile?.username || "User"}`} className={linkClass(`/profile/${profile?.username || "User"}`)}>
          <FaUser className="w-5 h-5" />
          <span>Profile</span>
        </Link>
      ) : (
        <Link href="/login" className={linkClass("/login")}>
          <FaUser className="w-5 h-5" />
          <span>Login</span>
        </Link>
      )}
    </nav>
  );
}