"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Bell, Mail, Smartphone } from "lucide-react"
import { notificationService } from "@/lib/notifications"
import { useSupabaseAuth } from "@/hooks/use-supabase-auth"

interface NotificationPreferences {
  email_enabled: boolean
  push_enabled: boolean
  leave_request_submitted: boolean
  leave_request_approved: boolean
  leave_request_rejected: boolean
  approval_required: boolean
  leave_reminder: boolean
  system_updates: boolean
}

export function NotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_enabled: true,
    push_enabled: true,
    leave_request_submitted: true,
    leave_request_approved: true,
    leave_request_rejected: true,
    approval_required: true,
    leave_reminder: true,
    system_updates: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const { user } = useSupabaseAuth()

  useEffect(() => {
    if (user) {
      fetchPreferences()
    }
  }, [user])

  const fetchPreferences = async () => {
    if (!user) return

    try {
      const data = await notificationService.getPreferences(user.id)
      if (data) {
        setPreferences({
          email_enabled: data.email_enabled,
          push_enabled: data.push_enabled,
          leave_request_submitted: data.leave_request_submitted,
          leave_request_approved: data.leave_request_approved,
          leave_request_rejected: data.leave_request_rejected,
          approval_required: data.approval_required,
          leave_reminder: data.leave_reminder,
          system_updates: data.system_updates,
        })
      }
    } catch (error) {
      console.error("Error fetching preferences:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    setMessage(null)

    try {
      const success = await notificationService.updatePreferences(user.id, preferences)

      if (success) {
        setMessage({ type: "success", text: "Notification preferences saved successfully!" })
      } else {
        setMessage({ type: "error", text: "Failed to save preferences. Please try again." })
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred while saving preferences." })
    } finally {
      setSaving(false)
    }

    // Clear message after 3 seconds
    setTimeout(() => setMessage(null), 3000)
  }

  const updatePreference = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences((prev) => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const preferenceGroups = [
    {
      title: "Delivery Methods",
      description: "Choose how you want to receive notifications",
      icon: Bell,
      preferences: [
        {
          key: "email_enabled" as keyof NotificationPreferences,
          label: "Email Notifications",
          description: "Receive notifications via email",
          icon: Mail,
        },
        {
          key: "push_enabled" as keyof NotificationPreferences,
          label: "Push Notifications",
          description: "Receive browser push notifications",
          icon: Smartphone,
        },
      ],
    },
    {
      title: "Leave Request Notifications",
      description: "Notifications about your leave requests",
      icon: CheckCircle,
      preferences: [
        {
          key: "leave_request_submitted" as keyof NotificationPreferences,
          label: "Request Submitted",
          description: "When your leave request is submitted",
        },
        {
          key: "leave_request_approved" as keyof NotificationPreferences,
          label: "Request Approved",
          description: "When your leave request is approved",
        },
        {
          key: "leave_request_rejected" as keyof NotificationPreferences,
          label: "Request Rejected",
          description: "When your leave request is rejected",
        },
      ],
    },
    {
      title: "Management Notifications",
      description: "Notifications for managers and supervisors",
      icon: AlertCircle,
      preferences: [
        {
          key: "approval_required" as keyof NotificationPreferences,
          label: "Approval Required",
          description: "When a leave request needs your approval",
        },
      ],
    },
    {
      title: "System Notifications",
      description: "General system and reminder notifications",
      icon: Bell,
      preferences: [
        {
          key: "leave_reminder" as keyof NotificationPreferences,
          label: "Leave Reminders",
          description: "Reminders about upcoming leave",
        },
        {
          key: "system_updates" as keyof NotificationPreferences,
          label: "System Updates",
          description: "Important system announcements and updates",
        },
      ],
    },
  ]

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {message && (
        <Alert className={message.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          {message.type === "success" ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={message.type === "success" ? "text-green-800" : "text-red-800"}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {preferenceGroups.map((group, groupIndex) => (
        <Card key={groupIndex} className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <group.icon className="h-5 w-5" />
              <span>{group.title}</span>
            </CardTitle>
            <CardDescription>{group.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {group.preferences.map((pref, prefIndex) => (
              <div key={prefIndex} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                <div className="flex items-start space-x-3">
                  {pref.icon && <pref.icon className="h-5 w-5 text-gray-500 mt-0.5" />}
                  <div>
                    <Label htmlFor={pref.key} className="text-base font-medium cursor-pointer">
                      {pref.label}
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">{pref.description}</p>
                  </div>
                </div>
                <Switch
                  id={pref.key}
                  checked={preferences[pref.key]}
                  onCheckedChange={(checked) => updatePreference(pref.key, checked)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {saving ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  )
}
