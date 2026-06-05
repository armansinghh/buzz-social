import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useUI } from "@/contexts/UIContext";
import { useNotifications } from "@/features/notifications/NotificationContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { formatRelativeTime } from "@/utils/formatRelativeTime";
import type { Notification } from "@/types/notification";
import { FaBell } from "react-icons/fa6";
import Avatar from "@/components/ui/Avatar";
import EmptyState from "@/components/ui/EmptyState";

function NotificationRow({
  notification,
}: {
  notification: Notification & { totalLikes?: number };
}) {
  const { profile: senderProfile } = useUserProfile(notification.senderId);
  const { closeModal } = useUI();

  const senderName = senderProfile?.username || senderProfile?.name || "User";
  const senderAvatar = senderProfile?.avatar || senderProfile?.photoURL;
  const senderUsername = senderProfile?.username;

  const getMessage = (): React.ReactNode => {
    if (notification.type === "like") {
      const total = notification.totalLikes || 1;
      if (total > 1) {
        return (
          <>
            and{" "}
            <span className="font-medium">
              {total - 1} {total - 1 === 1 ? "other" : "others"}
            </span>{" "}
            liked your post.
          </>
        );
      }
      return "liked your post.";
    }
    if (notification.type === "comment") return "commented on your post.";
    if (notification.type === "follow") return "started following you.";
    return "";
  };

  // 1. Determine where the whole row should navigate
  const rowTargetUrl =
    notification.type === "follow"
      ? senderUsername
        ? `/profile/${senderUsername}`
        : "#"
      : notification.postId
      ? `/post/${notification.postId}`
      : "#";

  // Helper to safely route and close the modal
  const handleLinkClick = (e: React.MouseEvent, requiredData: any) => {
    e.stopPropagation(); // Prevent overlapping link clicks
    if (!requiredData || requiredData === "#") {
      e.preventDefault(); // Stop navigation if data hasn't loaded
      return;
    }
    closeModal();
  };

  return (
    <div
      className={`relative flex items-start gap-4 px-6 py-4 border-b border-(--border-color) transition hover:bg-(--bg-secondary) ${
        !notification.isRead ? "bg-(--bg-secondary)" : ""
      }`}
    >
      {/* 2. THE BACKGROUND OVERLAY LINK (Makes the whole row clickable) */}
      <Link
        to={rowTargetUrl}
        onClick={(e) => handleLinkClick(e, rowTargetUrl)}
        className="absolute inset-0 z-0"
        aria-label="View notification details"
      />

      {/* 3. AVATAR LINK (Elevated z-index to sit above the background overlay) */}
      <Link
        to={senderUsername ? `/profile/${senderUsername}` : "#"}
        onClick={(e) => handleLinkClick(e, senderUsername)}
        className="shrink-0 rounded-full hover:opacity-80 transition-opacity block relative z-10 pointer-events-auto"
        aria-label={`View ${senderName}'s profile`}
      >
        <Avatar name={senderName} src={senderAvatar} size="md" />
      </Link>

      {/* 4. TEXT CONTAINER (pointer-events-none lets clicks fall through to the background overlay) */}
      <div className="flex-1 min-w-0 relative z-10 pointer-events-none">
        <p className="text-sm text-(--text-primary) leading-relaxed">
          {/* USERNAME LINK (Re-enabling pointer-events so this specific word is clickable) */}
          <Link
            to={senderUsername ? `/profile/${senderUsername}` : "#"}
            onClick={(e) => handleLinkClick(e, senderUsername)}
            className="font-semibold hover:underline pointer-events-auto"
          >
            {senderName}
          </Link>{" "}
          
          {/* MESSAGE TEXT (Plain text, click falls through to the post/profile link overlay) */}
          <span>{getMessage()}</span>
        </p>
        <p className="text-xs text-(--text-muted) mt-1">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>

      {!notification.isRead && (
        <div className="w-2.5 h-2.5 rounded-full bg-(--accent) mt-2 shrink-0 relative z-10" />
      )}
    </div>
  );
}

export default function NotificationModal() {
  const { activeModal, closeModal } = useUI();
  const { notifications, markAllAsRead, unreadCount, notificationsLoading } =
    useNotifications();

  const isOpen = activeModal === "notifications";

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, closeModal]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (unreadCount > 0) {
        markAllAsRead();
      }
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, markAllAsRead, unreadCount]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center modal-in bg-black/50 backdrop-blur-sm"
      onClick={closeModal}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg max-h-[80vh] bg-(--bg-primary) border border-(--border-color) rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-(--border-color) shrink-0">
          <h2 className="text-lg font-semibold text-(--text-primary)">
            Notifications
          </h2>
          <button
            onClick={closeModal}
            className="text-(--text-muted) hover:text-(--text-primary) transition"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto max-h-[70vh] main-scroll">
          {notificationsLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-start gap-4 px-6 py-4 border-b border-(--border-color)"
              >
                <div className="w-10 h-10 rounded-full bg-(--bg-tertiary) animate-pulse shrink-0" />
                <div className="flex-1 space-y-2.5 mt-1.5">
                  <div className="h-3.5 bg-(--bg-tertiary) rounded animate-pulse w-3/4" />
                  <div className="h-2.5 bg-(--bg-tertiary) rounded animate-pulse w-1/3" />
                </div>
              </div>
            ))
          ) : notifications.length === 0 ? (
            <EmptyState
              icon={<FaBell className="w-8 h-8" />}
              title="No notifications yet"
              subtitle="When people interact with you, you'll see it here."
            />
          ) : (
            notifications.map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}