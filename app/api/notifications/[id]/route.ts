import { type NextRequest, NextResponse } from "next/server"
import { notificationService } from "@/lib/notifications"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userHeader = request.headers.get("x-user-info")
    if (!userHeader) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    if (action === "mark_read") {
      const success = await notificationService.markAsRead(params.id)
      if (success) {
        return NextResponse.json({ success: true })
      } else {
        return NextResponse.json({ error: "Failed to mark notification as read" }, { status: 500 })
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error updating notification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userHeader = request.headers.get("x-user-info")
    if (!userHeader) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    const success = await notificationService.deleteNotification(params.id)
    
    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error deleting notification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}