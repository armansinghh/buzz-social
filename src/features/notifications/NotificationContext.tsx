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

  createNotification: (
    notification: Omit<
      Notification,
      "id" | "isRead" | "createdAt"
    >
  ) => Promise<void>;

  markAllAsRead: () => Promise<void>;
}

const NotificationContext =
  createContext<
    NotificationContextType | undefined
  >(undefined);

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuth();

  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  useEffect(() => {
    const fetchNotifications =
      async () => {
        if (!user) return;

        try {
          const q = query(
            collection(
              db,
              "users",
              user.uid,
              "notifications"
            ),
            orderBy(
              "createdAt",
              "desc"
            )
          );

          const snap =
            await getDocs(q);

          const data =
            snap.docs.map(
              (
                docSnap
              ) => {
                const docData = docSnap.data();
                return {
                  id: docSnap.id,
                  ...docData,
                  createdAt:
                    docData.createdAt && typeof (docData.createdAt as any).toDate === "function"
                      ? (docData.createdAt as any).toDate().toISOString()
                      : typeof docData.createdAt === "string"
                      ? docData.createdAt
                      : new Date().toISOString(),
                };
              }
            ) as Notification[];

          setNotifications(data);
        } catch (err) {
          console.error(
            "Failed loading notifications:",
            err
          );
        }
      };

    fetchNotifications();
  }, [user]);

  const createNotification =
    useCallback(
      async (
        notification: Omit<
          Notification,
          | "id"
          | "isRead"
          | "createdAt"
        >
      ) => {
        try {
          await addDoc(
            collection(
              db,
              "users",
              notification.recipientId,
              "notifications"
            ),
            {
              ...notification,

              isRead: false,

              createdAt:
                serverTimestamp(),
            }
          );
        } catch (err) {
          console.error(
            "Failed creating notification:",
            err
          );
        }
      },
      []
    );

  const markAllAsRead =
    useCallback(
      async () => {
        if (!user) return;

        try {
          await Promise.all(
            notifications.map(
              (
                notification
              ) =>
                updateDoc(
                  doc(
                    db,
                    "users",
                    user.uid,
                    "notifications",
                    notification.id
                  ),
                  {
                    isRead: true,
                  }
                )
            )
          );

          setNotifications(
            (
              prev
            ) =>
              prev.map(
                (
                  n
                ) => ({
                  ...n,
                  isRead: true,
                })
              )
          );
        } catch (err) {
          console.error(
            "Failed marking notifications:",
            err
          );
        }
      },
      [
        notifications,
        user,
      ]
    );

  const unreadCount =
    notifications.filter(
      (n) => !n.isRead
    ).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,

        unreadCount,

        createNotification,

        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications =
  () => {
    const context =
      useContext(
        NotificationContext
      );

    if (!context) {
      throw new Error(
        "useNotifications must be used within NotificationProvider"
      );
    }

    return context;
  };