"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { NotificationPreferences } from "@/components/notifications/notification-preferences"

export default function NotificationSettingsPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <Link href="/notifications">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Notifications
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notification Settings</h1>
            <p className="text-gray-600">Manage how and when you receive notifications</p>
          </div>
        </div>
      </div>

      <NotificationPreferences />
    </div>
  )
}
