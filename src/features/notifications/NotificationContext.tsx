"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  setDoc,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Notification } from "@/types/notification";
import { useAuth } from "@/features/auth/AuthContext";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  notificationsLoading: boolean; // Added for skeleton loader
  createNotification: (
    notification: Omit<Notification, "id" | "isRead" | "createdAt"> & {
      totalLikes?: number;
    },
  ) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) {
        setNotificationsLoading(false);
        return;
      }

      setNotificationsLoading(true);
      try {
        const q = query(
          collection(db, "users", user.uid, "notifications"),
          orderBy("createdAt", "desc"),
        );
        const snap = await getDocs(q);
        const data = snap.docs.map((docSnap) => {
          const docData = docSnap.data();
          return {
            id: docSnap.id,
            ...docData,
            createdAt: docData.createdAt?.toDate
              ? docData.createdAt.toDate().toISOString()
              : new Date().toISOString(),
          };
        }) as Notification[];
        setNotifications(data);
      } catch (err) {
        console.error("Failed loading notifications:", err);
      } finally {
        setNotificationsLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  const createNotification = useCallback(
    async (
      notification: Omit<Notification, "id" | "isRead" | "createdAt"> & {
        totalLikes?: number;
      },
    ) => {
      try {
        // SMART UPSERT: Deterministic ID groups all likes for a post
        if (notification.type === "like" && notification.postId) {
          const notifRef = doc(
            db,
            "users",
            notification.recipientId,
            "notifications",
            `like_${notification.postId}`,
          );
          await setDoc(
            notifRef,
            {
              ...notification,
              isRead: false,
              createdAt: serverTimestamp(),
            },
            { merge: true },
          );
          return;
        }

        // DEFAULT: Create new doc for comments/follows
        await addDoc(
          collection(db, "users", notification.recipientId, "notifications"),
          {
            ...notification,
            isRead: false,
            createdAt: serverTimestamp(),
          },
        );
      } catch (err) {
        console.error("Failed creating notification:", err);
      }
    },
    [],
  );

  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    // QUOTA FIX: Only process notifications that are actually unread
    const unreadNotifs = notifications.filter((n) => !n.isRead);
    if (unreadNotifs.length === 0) return;

    try {
      await Promise.all(
        unreadNotifs.map((notification) =>
          updateDoc(
            doc(db, "users", user.uid, "notifications", notification.id),
            { isRead: true },
          ),
        ),
      );
      setNotifications((prev) =>
        prev.map((n) => (n.isRead ? n : { ...n, isRead: true })),
      );
    } catch (err) {
      console.error("Failed marking notifications:", err);
    }
  }, [notifications, user]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        notificationsLoading,
        createNotification,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context)
    throw new Error(
      "useNotifications must be used within NotificationProvider",
    );
  return context;
};
