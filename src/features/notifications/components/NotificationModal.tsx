import { useEffect } from "react";
import { useUI } from "@/contexts/UIContext";
import { useNotifications } from "@/features/notifications/NotificationContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import Avatar from "@/components/ui/Avatar";
import type { Notification } from "@/types/notification";

function NotificationRow({
  notification,
}: {
  notification: Notification;
}) {
  const senderProfile = useUserProfile(notification.senderId);

  const senderName =
    senderProfile?.username ||
    senderProfile?.name ||
    "User";

  const senderAvatar =
    senderProfile?.avatar ||
    senderProfile?.photoURL;

  const getMessage = (): React.ReactNode => {
    if (notification.type === "like") {
      if ((notification as any).otherCount > 0) {
        return (
          <>
            liked your post with{" "}
            <span className="font-medium">
              {(notification as any).otherCount} others
            </span>
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
      className={`flex items-start gap-4 px-6 py-4 border-b border-(--border-color)
        transition hover:bg-(--bg-secondary)
        ${!notification.isRead ? "bg-(--bg-secondary)" : ""}`}
    >
      <Avatar name={senderName} src={senderAvatar} size="md" />

      <div className="flex-1 min-w-0">
        <p className="text-sm text-(--text-primary) leading-relaxed">
          <span className="font-semibold">{senderName}</span>{" "}
          {getMessage()}
        </p>

        <p className="text-xs text-(--text-muted) mt-1">
          {new Date(notification.createdAt).toLocaleString()}
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
  const { notifications, markAllAsRead } = useNotifications();

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
      markAllAsRead();
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, markAllAsRead]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={closeModal}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg max-h-[80vh] bg-(--bg-primary)
          border border-(--border-color)
          rounded-t-3xl sm:rounded-3xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-(--border-color)">
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

        <div className="overflow-y-auto max-h-[70vh]">
          {notifications.length === 0 ? (
            <div className="py-20 text-center text-(--text-muted)">
              No notifications yet.
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