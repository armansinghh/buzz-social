export type NotificationType =
  | "like"
  | "comment"
  | "follow";

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
}