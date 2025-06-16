import { type NextRequest, NextResponse } from "next/server"
import { notificationService } from "@/lib/notifications"

export async function GET(request: NextRequest) {
  try {
    const userHeader = request.headers.get("x-user-info")
    if (!userHeader) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    const user = JSON.parse(userHeader)
    
    const count = await notificationService.getUnreadCount(user.id)
    
    return NextResponse.json({ count })
  } catch (error) {
    console.error("Error fetching unread count:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}