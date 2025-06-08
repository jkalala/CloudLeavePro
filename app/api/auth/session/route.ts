import { type NextRequest, NextResponse } from "next/server"
import { getUserById } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    console.log("Session API called")
    const sessionCookie = request.cookies.get("session")
    console.log("Session cookie:", sessionCookie ? "Found" : "Not found")

    if (!sessionCookie || !sessionCookie.value) {
      console.log("No session cookie found")
      return NextResponse.json({ user: null })
    }

    try {
      const sessionData = JSON.parse(sessionCookie.value)
      console.log("Session data:", sessionData)

      if (!sessionData.userId) {
        console.log("No user ID in session")
        return NextResponse.json({ user: null })
      }

      const user = getUserById(sessionData.userId)
      console.log("User from ID:", user ? user.email : "Not found")

      if (!user) {
        console.log("User not found")
        return NextResponse.json({ user: null })
      }

      return NextResponse.json({ user })
    } catch (parseError) {
      console.error("Error parsing session cookie:", parseError)
      return NextResponse.json({ user: null })
    }
  } catch (error) {
    console.error("Session error:", error)
    return NextResponse.json({ user: null })
  }
}
