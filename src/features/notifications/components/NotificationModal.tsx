import { useEffect } from "react";
import { useUI } from "@/contexts/UIContext";
import { useNotifications } from "@/features/notifications/NotificationContext";

export default function NotificationModal() {
  const { activeModal, closeModal } =
    useUI();

  const {
    notifications,
    markAllAsRead,
  } = useNotifications();

  const isOpen =
    activeModal ===
    "notifications";

  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (
      e: KeyboardEvent
    ) => {
      if (e.key === "Escape")
        closeModal();
    };

    window.addEventListener(
      "keydown",
      handleEsc
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleEsc
      );
  }, [isOpen, closeModal]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow =
        "hidden";

      markAllAsRead();
    } else {
      document.body.style.overflow =
        "";
    }

    return () => {
      document.body.style.overflow =
        "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getMessage = (
    notification: any
  ) => {
    if (
      notification.type === "like"
    ) {
      if (
        notification.otherCount >
        0
      ) {
        return (
          <>
            liked your post with{" "}
            <span className="font-medium">
              {
                notification.otherCount
              }{" "}
              others
            </span>
          </>
        );
      }

      return "liked your post.";
    }

    if (
      notification.type ===
      "comment"
    ) {
      return "commented on your post.";
    }

    if (
      notification.type ===
      "follow"
    ) {
      return "started following you.";
    }

    return "";
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={closeModal}
    >
      <div
        onClick={(e) =>
          e.stopPropagation()
        }
        className="w-full sm:max-w-lg max-h-[80vh] bg-(--bg-primary) border border-(--border-color) rounded-t-3xl sm:rounded-3xl overflow-hidden"
      >
        {/* Header */}
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

        {/* Content */}
        <div className="overflow-y-auto max-h-[70vh]">
          {notifications.length ===
          0 ? (
            <div className="py-20 text-center text-(--text-muted)">
              No notifications yet.
            </div>
          ) : (
            notifications.map(
              (
                notification
              ) => (
                <div
                  key={
                    notification.id
                  }
                  className={`flex items-start gap-4 px-6 py-4 border-b border-(--border-color) transition hover:bg-(--bg-secondary)
                    ${
                      !notification.isRead
                        ? "bg-(--bg-secondary)"
                        : ""
                    }`}
                >
                  {/* Avatar */}
                  <img
                    src={
                      notification.senderAvatar
                    }
                    alt={
                      notification.senderName
                    }
                    className="w-11 h-11 rounded-full object-cover border border-(--border-color)"
                  />

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-(--text-primary) leading-relaxed">
                      <span className="font-semibold">
                        {
                          notification.senderName
                        }
                      </span>{" "}
                      {getMessage(
                        notification
                      )}
                    </p>

                    <p className="text-xs text-(--text-muted) mt-1">
                      {new Date(
                        notification.createdAt
                      ).toLocaleString()}
                    </p>
                  </div>

                  {/* Unread Dot */}
                  {!notification.isRead && (
                    <div className="w-2.5 h-2.5 rounded-full bg-(--accent) mt-2" />
                  )}
                </div>
              )
            )
          )}
        </div>
      </div>
    </div>
  );
}