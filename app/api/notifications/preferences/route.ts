import { type NextRequest, NextResponse } from "next/server"
import { notificationService } from "@/lib/notifications"

export async function GET(request: NextRequest) {
  try {
    const userHeader = request.headers.get("x-user-info")
    if (!userHeader) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    const user = JSON.parse(userHeader)
    
    const preferences = await notificationService.getPreferences(user.id)
    
    return NextResponse.json({ preferences })
  } catch (error) {
    console.error("Error fetching notification preferences:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userHeader = request.headers.get("x-user-info")
    if (!userHeader) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    const user = JSON.parse(userHeader)
    const preferences = await request.json()
    
    const success = await notificationService.updatePreferences(user.id, preferences)
    
    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error updating notification preferences:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}