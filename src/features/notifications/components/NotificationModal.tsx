import { useEffect } from "react";
import { useUI } from "@/contexts/UIContext";
import { useNotifications } from "@/features/notifications/NotificationContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import Avatar from "@/components/ui/Avatar";
import { formatRelativeTime } from "@/utils/formatRelativeTime";
import type { Notification } from "@/types/notification";

function NotificationRow({
  notification,
}: {
  notification: Notification & { totalLikes?: number };
}) {
  const { profile: senderProfile } = useUserProfile(notification.senderId);

  const senderName = senderProfile?.username || senderProfile?.name || "User";
  const senderAvatar = senderProfile?.avatar || senderProfile?.photoURL;

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

  return (
    <div
      className={`flex items-start gap-4 px-6 py-4 border-b border-(--border-color) transition hover:bg-(--bg-secondary) ${!notification.isRead ? "bg-(--bg-secondary)" : ""}`}
    >
      <Avatar name={senderName} src={senderAvatar} size="md" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-(--text-primary) leading-relaxed">
          <span className="font-semibold">{senderName}</span> {getMessage()}
        </p>
        <p className="text-xs text-(--text-muted) mt-1">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>
      {!notification.isRead && (
        <div className="w-2.5 h-2.5 rounded-full bg-(--accent) mt-2 shrink-0" />
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
      // LOOP CRASH FIX: Only fire if there are unread notifications
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
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
            // SKELETON LOADER
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
            // EMPTY STATE
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-(--bg-tertiary) flex items-center justify-center mb-1">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="text-(--text-muted)"
                  strokeWidth="1.5"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
              </div>
              <p className="text-(--text-primary) font-medium">
                No notifications yet
              </p>
              <p className="text-sm text-(--text-muted)">
                When people interact with you, you'll see it here.
              </p>
            </div>
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
