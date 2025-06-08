"use client"

import { useState, useEffect } from "react"
import { notificationService } from "@/lib/notifications"
import { useSupabaseAuth } from "@/hooks/use-supabase-auth"

export function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const { user } = useSupabaseAuth()

  useEffect(() => {
    if (user) {
      fetchUnreadCount()

      // Set up polling for real-time updates
      const interval = setInterval(fetchUnreadCount, 30000) // Poll every 30 seconds

      return () => clearInterval(interval)
    }
  }, [user])

  const fetchUnreadCount = async () => {
    if (!user) return

    try {
      const count = await notificationService.getUnreadCount(user.id)
      setUnreadCount(count)
    } catch (error) {
      console.error("Error fetching unread count:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    const success = await notificationService.markAsRead(notificationId)
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

  return {
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refreshCount: fetchUnreadCount,
  }
}
