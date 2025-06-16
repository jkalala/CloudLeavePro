import { type NextRequest, NextResponse } from "next/server"
import { notificationService } from "@/lib/notifications"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const type = searchParams.get("type")
    const unreadOnly = searchParams.get("unread_only") === "true"

    // Get user from session/auth
    const userHeader = request.headers.get("x-user-info")
    if (!userHeader) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    const user = JSON.parse(userHeader)
    
    // Get notifications
    const notifications = await notificationService.getUserNotifications(user.id, limit, offset)
    
    // Filter by type if specified
    let filteredNotifications = notifications
    if (type) {
      filteredNotifications = notifications.filter((n: any) => n.type === type)
    }
    
    // Filter by read status if specified
    if (unreadOnly) {
      filteredNotifications = filteredNotifications.filter((n: any) => !n.is_read)
    }

    return NextResponse.json({ 
      notifications: filteredNotifications,
      total: filteredNotifications.length 
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userHeader = request.headers.get("x-user-info")
    if (!userHeader) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    const user = JSON.parse(userHeader)
    const body = await request.json()
    const { type, data, priority = "normal", actionUrl, actionLabel, expiresAt } = body

    const success = await notificationService.createNotification({
      userId: user.id,
      type,
      data,
      priority,
      actionUrl,
      actionLabel,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    })

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Failed to create notification" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}