import { getSupabaseClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/database.types"

type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"]
type NotificationInsert = Database["public"]["Tables"]["notifications"]["Insert"]

export interface NotificationData {
  employee_name?: string
  approver_name?: string
  leave_type?: string
  start_date?: string
  end_date?: string
  duration?: number
  reason?: string
  rejection_reason?: string
  days_until?: number
  [key: string]: any
}

export interface CreateNotificationParams {
  userId: string
  type: string
  data: NotificationData
  priority?: "low" | "normal" | "high" | "urgent"
  actionUrl?: string
  actionLabel?: string
  expiresAt?: Date
  relatedLeaveRequestId?: string
}

export class NotificationService {
  private supabase = getSupabaseClient()

  // Template replacement function
  private replaceTemplateVariables(template: string, data: NotificationData): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key]?.toString() || match
    })
  }

  // Create a notification
  async createNotification(params: CreateNotificationParams): Promise<boolean> {
    try {
      // Get notification template
      const { data: template, error: templateError } = await this.supabase
        .from("notification_templates")
        .select("*")
        .eq("type", params.type)
        .eq("is_active", true)
        .single()

      if (templateError || !template) {
        console.error("Notification template not found:", params.type)
        return false
      }

      // Replace template variables
      const title = this.replaceTemplateVariables(template.title_template, params.data)
      const message = this.replaceTemplateVariables(template.message_template, params.data)

      // Create notification
      const notification: NotificationInsert = {
        user_id: params.userId,
        title,
        message,
        type: params.type,
        priority: params.priority || "normal",
        action_url: params.actionUrl,
        action_label: params.actionLabel,
        expires_at: params.expiresAt?.toISOString(),
        related_leave_request_id: params.relatedLeaveRequestId,
        metadata: params.data,
      }

      const { error } = await this.supabase.from("notifications").insert(notification)

      if (error) {
        console.error("Error creating notification:", error)
        return false
      }

      // Check if user wants email notifications
      await this.sendEmailNotification(params.userId, template, params.data)

      return true
    } catch (error) {
      console.error("Error in createNotification:", error)
      return false
    }
  }

  // Send email notification (placeholder - integrate with your email service)
  private async sendEmailNotification(userId: string, template: any, data: NotificationData) {
    try {
      // Get user preferences
      const { data: preferences } = await this.supabase
        .from("notification_preferences")
        .select("email_enabled")
        .eq("user_id", userId)
        .single()

      if (!preferences?.email_enabled) {
        return // User has disabled email notifications
      }

      // Get user email
      const { data: user } = await this.supabase.from("users").select("email, name").eq("id", userId).single()

      if (!user?.email) {
        return
      }

      // Replace template variables for email
      const subject = this.replaceTemplateVariables(template.email_subject_template || template.title_template, data)
      const body = this.replaceTemplateVariables(template.email_body_template || template.message_template, data)

      // TODO: Integrate with your email service (SendGrid, AWS SES, etc.)
      console.log("Email notification would be sent:", {
        to: user.email,
        subject,
        body,
      })

      // Example integration with a hypothetical email service:
      // await emailService.send({
      //   to: user.email,
      //   subject,
      //   html: body.replace(/\n/g, '<br>')
      // })
    } catch (error) {
      console.error("Error sending email notification:", error)
    }
  }

  // Get notifications for a user
  async getUserNotifications(userId: string, limit = 50, offset = 0) {
    try {
      const { data, error } = await this.supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error("Error fetching notifications:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Error in getUserNotifications:", error)
      return []
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("notifications")
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq("id", notificationId)

      return !error
    } catch (error) {
      console.error("Error marking notification as read:", error)
      return false
    }
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("notifications")
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("is_read", false)

      return !error
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      return false
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.from("notifications").delete().eq("id", notificationId)

      return !error
    } catch (error) {
      console.error("Error deleting notification:", error)
      return false
    }
  }

  // Get unread count
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_read", false)

      if (error) {
        console.error("Error getting unread count:", error)
        return 0
      }

      return count || 0
    } catch (error) {
      console.error("Error in getUnreadCount:", error)
      return 0
    }
  }

  // Update notification preferences
  async updatePreferences(
    userId: string,
    preferences: Partial<Database["public"]["Tables"]["notification_preferences"]["Update"]>,
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase.from("notification_preferences").upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString(),
      })

      return !error
    } catch (error) {
      console.error("Error updating notification preferences:", error)
      return false
    }
  }

  // Get notification preferences
  async getPreferences(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", userId)
        .single()

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        console.error("Error fetching notification preferences:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error in getPreferences:", error)
      return null
    }
  }

  // Cleanup expired notifications
  async cleanupExpiredNotifications(): Promise<void> {
    try {
      const { error } = await this.supabase.rpc("cleanup_expired_notifications")

      if (error) {
        console.error("Error cleaning up expired notifications:", error)
      }
    } catch (error) {
      console.error("Error in cleanupExpiredNotifications:", error)
    }
  }
}

// Singleton instance
export const notificationService = new NotificationService()

// Helper functions for common notification types
export const createLeaveRequestNotification = async (
  employeeId: string,
  leaveRequestId: string,
  data: NotificationData,
) => {
  return notificationService.createNotification({
    userId: employeeId,
    type: "leave_request_submitted",
    data,
    actionUrl: `/dashboard?tab=overview`,
    actionLabel: "View Request",
    relatedLeaveRequestId: leaveRequestId,
  })
}

export const createApprovalRequiredNotification = async (
  approverId: string,
  leaveRequestId: string,
  data: NotificationData,
) => {
  return notificationService.createNotification({
    userId: approverId,
    type: "approval_required",
    data,
    priority: "high",
    actionUrl: `/dashboard?tab=approvals`,
    actionLabel: "Review Request",
    relatedLeaveRequestId: leaveRequestId,
  })
}

export const createLeaveApprovedNotification = async (
  employeeId: string,
  leaveRequestId: string,
  data: NotificationData,
) => {
  return notificationService.createNotification({
    userId: employeeId,
    type: "leave_request_approved",
    data,
    priority: "high",
    actionUrl: `/dashboard?tab=overview`,
    actionLabel: "View Details",
    relatedLeaveRequestId: leaveRequestId,
  })
}

export const createLeaveRejectedNotification = async (
  employeeId: string,
  leaveRequestId: string,
  data: NotificationData,
) => {
  return notificationService.createNotification({
    userId: employeeId,
    type: "leave_request_rejected",
    data,
    priority: "high",
    actionUrl: `/dashboard?tab=overview`,
    actionLabel: "View Details",
    relatedLeaveRequestId: leaveRequestId,
  })
}
