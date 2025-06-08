"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Search, Check, CheckCheck, Trash2, AlertCircle, Info, Clock, Settings, ArrowLeft } from "lucide-react"
import { notificationService } from "@/lib/notifications"
import { useSupabaseAuth } from "@/hooks/use-supabase-auth"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { NotificationPreferences } from "@/components/notifications/notification-preferences"

interface Notification {
  id: string
  title: string
  message: string
  type: string
  priority: "low" | "normal" | "high" | "urgent"
  is_read: boolean
  action_url?: string
  action_label?: string
  created_at: string
  read_at?: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])
  const { user } = useSupabaseAuth()

  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user])

  useEffect(() => {
    filterNotifications()
  }, [notifications, searchTerm, filterType, filterStatus])

  const fetchNotifications = async () => {
    if (!user) return

    setLoading(true)
    try {
      const data = await notificationService.getUserNotifications(user.id, 100)
      setNotifications(data as Notification[])
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterNotifications = () => {
    let filtered = notifications

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          n.message.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter((n) => n.type === filterType)
    }

    // Filter by status
    if (filterStatus === "unread") {
      filtered = filtered.filter((n) => !n.is_read)
    } else if (filterStatus === "read") {
      filtered = filtered.filter((n) => n.is_read)
    }

    setFilteredNotifications(filtered)
  }

  const markAsRead = async (notificationId: string) => {
    const success = await notificationService.markAsRead(notificationId)
    if (success) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)),
      )
    }
  }

  const markAllAsRead = async () => {
    if (!user) return

    const success = await notificationService.markAllAsRead(user.id)
    if (success) {
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          is_read: true,
          read_at: new Date().toISOString(),
        })),
      )
    }
  }

  const deleteNotification = async (notificationId: string) => {
    const success = await notificationService.deleteNotification(notificationId)
    if (success) {
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
      setSelectedNotifications((prev) => prev.filter((id) => id !== notificationId))
    }
  }

  const deleteSelectedNotifications = async () => {
    const promises = selectedNotifications.map((id) => notificationService.deleteNotification(id))
    await Promise.all(promises)
    setNotifications((prev) => prev.filter((n) => !selectedNotifications.includes(n.id)))
    setSelectedNotifications([])
  }

  const markSelectedAsRead = async () => {
    const promises = selectedNotifications.map((id) => notificationService.markAsRead(id))
    await Promise.all(promises)
    setNotifications((prev) =>
      prev.map((n) =>
        selectedNotifications.includes(n.id) ? { ...n, is_read: true, read_at: new Date().toISOString() } : n,
      ),
    )
    setSelectedNotifications([])
  }

  const toggleSelectNotification = (notificationId: string) => {
    setSelectedNotifications((prev) =>
      prev.includes(notificationId) ? prev.filter((id) => id !== notificationId) : [...prev, notificationId],
    )
  }

  const selectAllNotifications = () => {
    setSelectedNotifications(filteredNotifications.map((n) => n.id))
  }

  const clearSelection = () => {
    setSelectedNotifications([])
  }

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
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "border-l-red-500"
      case "high":
        return "border-l-orange-500"
      case "normal":
        return "border-l-blue-500"
      case "low":
        return "border-l-gray-500"
      default:
        return "border-l-blue-500"
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600">
                {unreadCount > 0
                  ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                  : "All notifications read"}
              </p>
            </div>
          </div>
          <Link href="/notifications/settings">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="notifications" className="w-full">
          <TabsList>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="preferences">
              <Settings className="h-4 w-4 mr-2" />
              Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="space-y-6">
            {/* Filters and Actions */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search notifications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="leave_request_submitted">Request Submitted</SelectItem>
                        <SelectItem value="leave_request_approved">Request Approved</SelectItem>
                        <SelectItem value="leave_request_rejected">Request Rejected</SelectItem>
                        <SelectItem value="approval_required">Approval Required</SelectItem>
                        <SelectItem value="leave_reminder">Leave Reminder</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="unread">Unread</SelectItem>
                        <SelectItem value="read">Read</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Bulk Actions */}
                {selectedNotifications.length > 0 && (
                  <div className="flex items-center justify-between mt-4 p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm text-blue-800">
                      {selectedNotifications.length} notification{selectedNotifications.length !== 1 ? "s" : ""}{" "}
                      selected
                    </span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={markSelectedAsRead}>
                        <Check className="h-4 w-4 mr-1" />
                        Mark as Read
                      </Button>
                      <Button size="sm" variant="outline" onClick={deleteSelectedNotifications}>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                      <Button size="sm" variant="ghost" onClick={clearSelection}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex justify-between items-center mt-4">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={selectAllNotifications}
                      disabled={filteredNotifications.length === 0}
                    >
                      Select All
                    </Button>
                    {unreadCount > 0 && (
                      <Button size="sm" variant="outline" onClick={markAllAsRead}>
                        <CheckCheck className="h-4 w-4 mr-1" />
                        Mark All as Read
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    Showing {filteredNotifications.length} of {notifications.length} notifications
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Notifications List */}
            <div className="space-y-2">
              {loading ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </CardContent>
                </Card>
              ) : filteredNotifications.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <Bell className="h-12 w-12 mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No notifications found</h3>
                    <p className="text-sm text-center">
                      {searchTerm || filterType !== "all" || filterStatus !== "all"
                        ? "Try adjusting your filters or search terms"
                        : "You're all caught up! New notifications will appear here."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredNotifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`border-l-4 transition-all hover:shadow-md ${getPriorityColor(
                      notification.priority,
                    )} ${!notification.is_read ? "bg-blue-50/30" : ""}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <input
                          type="checkbox"
                          checked={selectedNotifications.includes(notification.id)}
                          onChange={() => toggleSelectNotification(notification.id)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            {getPriorityIcon(notification.priority)}
                            <h3 className={`font-medium ${!notification.is_read ? "text-gray-900" : "text-gray-600"}`}>
                              {notification.title}
                            </h3>
                            {!notification.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                            <Badge variant="outline" className="text-xs">
                              {notification.type.replace(/_/g, " ")}
                            </Badge>
                          </div>
                          <p className={`text-sm mb-3 ${!notification.is_read ? "text-gray-700" : "text-gray-500"}`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </span>
                            <div className="flex items-center space-x-2">
                              {notification.action_url && notification.action_label && (
                                <Link href={notification.action_url}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      if (!notification.is_read) {
                                        markAsRead(notification.id)
                                      }
                                    }}
                                  >
                                    {notification.action_label}
                                  </Button>
                                </Link>
                              )}
                              {!notification.is_read && (
                                <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteNotification(notification.id)}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="preferences">
            <NotificationPreferences />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
