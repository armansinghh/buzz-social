import { useEffect } from "react";
import { useUI } from "@/features/ui/UIContext";
import { useNotifications } from "@/features/notifications/NotificationContext";
import type { NotificationType } from "@/features/notifications/notifications.types";

const ICONS: Record<NotificationType, { icon: string; bg: string; color: string }> = {
  like: { icon: "❤️", bg: "bg-red-50 dark:bg-red-500/10", color: "text-red-500" },
  comment: { icon: "💬", bg: "bg-blue-50 dark:bg-blue-500/10", color: "text-blue-500" },
  follow: { icon: "👤", bg: "bg-green-50 dark:bg-green-500/10", color: "text-green-500" },
};

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
    return () => { document.body.style.overflow = ""; };
  }, [isOpen, markAllAsRead]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={closeModal}
    >
      <div
        className="bg-[var(--bg-primary)] w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl overflow-hidden modal-in border border-[var(--border-color)]"
        style={{ boxShadow: "var(--shadow-md)", maxHeight: "80vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-color)]">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Notifications</h2>
          <button
            onClick={closeModal}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto main-scroll" style={{ maxHeight: "calc(80vh - 64px)" }}>
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-[var(--text-muted)]">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-color)]">
              {notifications.map((notification) => {
                const meta = ICONS[notification.type];
                return (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-3 px-5 py-4 transition-colors
                      ${!notification.isRead ? "bg-[var(--bg-secondary)]" : "bg-[var(--bg-primary)]"}
                      hover:bg-[var(--bg-tertiary)]`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
                      <span className="text-base">{meta.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[var(--text-primary)]">{notification.message}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        {new Date(notification.createdAt).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}