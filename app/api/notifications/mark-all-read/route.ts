import { type NextRequest, NextResponse } from "next/server"
import { notificationService } from "@/lib/notifications"

export async function POST(request: NextRequest) {
  try {
    const userHeader = request.headers.get("x-user-info")
    if (!userHeader) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    const user = JSON.parse(userHeader)
    
    const success = await notificationService.markAllAsRead(user.id)
    
    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Failed to mark all notifications as read" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}