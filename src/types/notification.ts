export type NotificationType = "like" | "comment" | "follow";

export interface Notification {
  id: string;
  recipientId: string;
  senderId: string;
  type: NotificationType;
  postId?: string;
  isRead: boolean;
  createdAt: string;
}