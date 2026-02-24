import type { Notification } from "./notifications.types";

export const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "like",
    message: "John liked your post",
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    type: "comment",
    message: "Sarah commented on your post",
    isRead: false,
    createdAt: new Date().toISOString(),
  },
];