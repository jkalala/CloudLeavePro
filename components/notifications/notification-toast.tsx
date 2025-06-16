"use client"

import { useEffect } from "react"
import { toast } from "sonner"
import { Bell, CheckCircle, AlertCircle, Info, Clock } from "lucide-react"

interface NotificationToastProps {
  notification: {
    id: string
    title: string
    message: string
    type: string
    priority: "low" | "normal" | "high" | "urgent"
    action_url?: string
    action_label?: string
  }
  onAction?: (url: string) => void
}

export function NotificationToast({ notification, onAction }: NotificationToastProps) {
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "high":
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      case "normal":
        return <Info className="h-4 w-4 text-blue-500" />
      case "low":
        return <Clock className="h-4 w-4 text-gray-500" />
      default:
        return <Bell className="h-4 w-4 text-blue-500" />
    }
  }

  const getToastType = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "error"
      case "high":
        return "warning"
      case "normal":
        return "info"
      case "low":
        return "info"
      default:
        return "info"
    }
  }

  useEffect(() => {
    const toastId = toast(notification.title, {
      description: notification.message,
      icon: getPriorityIcon(notification.priority),
      duration: notification.priority === "urgent" ? 10000 : 5000,
      action: notification.action_url && notification.action_label ? {
        label: notification.action_label,
        onClick: () => onAction?.(notification.action_url!),
      } : undefined,
      className: `notification-toast priority-${notification.priority}`,
    })

    return () => {
      toast.dismiss(toastId)
    }
  }, [notification, onAction])

  return null
}