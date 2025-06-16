"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useSupabaseAuth } from "@/hooks/use-supabase-auth"
import { notificationService } from "@/lib/notifications"
import { NotificationToast } from "./notification-toast"
import { useRouter } from "next/navigation"

interface NotificationContextType {
  unreadCount: number
  refreshNotifications: () => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotificationContext() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotificationContext must be used within NotificationProvider")
  }
  return context
}

interface NotificationProviderProps {
  children: React.ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [lastNotificationCheck, setLastNotificationCheck] = useState<Date>(new Date())
  const { user } = useSupabaseAuth()
  const router = useRouter()

  const fetchUnreadCount = async () => {
    if (!user) return

    try {
      const count = await notificationService.getUnreadCount(user.id)
      setUnreadCount(count)
    } catch (error) {
      console.error("Error fetching unread count:", error)
    }
  }

  const checkForNewNotifications = async () => {
    if (!user) return

    try {
      // Get notifications since last check
      const notifications = await notificationService.getUserNotifications(user.id, 10, 0)
      const newNotifications = notifications.filter((n: any) => 
        new Date(n.created_at) > lastNotificationCheck && !n.is_read
      )

      // Show toast notifications for new notifications
      newNotifications.forEach((notification: any) => {
        if (notification.priority === "high" || notification.priority === "urgent") {
          // Show toast for high priority notifications
          const toastComponent = (
            <NotificationToast
              key={notification.id}
              notification={notification}
              onAction={(url) => router.push(url)}
            />
          )
        }
      })

      setLastNotificationCheck(new Date())
    } catch (error) {
      console.error("Error checking for new notifications:", error)
    }
  }

  const markAsRead = async (id: string) => {
    const success = await notificationService.markAsRead(id)
    if (success) {
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }
    return success
  }

  const markAllAsRead = async () => {
    if (!user) return false

    const success = await notificationService.markAllAsRead(user.id)
    if (success) {
      setUnreadCount(0)
    }
    return success
  }

  const refreshNotifications = () => {
    fetchUnreadCount()
    checkForNewNotifications()
  }

  useEffect(() => {
    if (user) {
      fetchUnreadCount()
      
      // Set up polling for new notifications
      const interval = setInterval(() => {
        checkForNewNotifications()
        fetchUnreadCount()
      }, 30000) // Check every 30 seconds

      return () => clearInterval(interval)
    }
  }, [user])

  const contextValue: NotificationContextType = {
    unreadCount,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
  }

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  )
}