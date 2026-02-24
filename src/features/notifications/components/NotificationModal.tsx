import { useEffect } from "react";
import { useUI } from "@/features/ui/UIContext";
import { useNotifications } from "@/features/notifications/NotificationContext";

export default function NotificationModal() {
  const { activeModal, closeModal } = useUI();
  const { notifications, markAllAsRead } = useNotifications();

  const isOpen = activeModal === "notifications";

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, closeModal]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      markAllAsRead(); // 🔥 Auto-mark when opened
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={closeModal}
    >
      <div
        className="bg-white w-full max-w-lg rounded-xl p-6 shadow-xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Notifications</h2>
          <button
            onClick={closeModal}
            className="text-gray-500 hover:text-black"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        {notifications.length === 0 ? (
          <div className="text-gray-500 text-center py-6">
            No notifications yet.
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border ${
                  notification.isRead
                    ? "bg-white"
                    : "bg-gray-100"
                }`}
              >
                <p className="text-sm">{notification.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}