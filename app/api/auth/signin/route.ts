import { type NextRequest, NextResponse } from "next/server"
import { validateCredentials } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    console.log("Signin API called")
    const body = await request.json()
    const { email, password } = body

    console.log("Credentials received:", { email, password: "***" })

    if (!email || !password) {
      console.log("Missing credentials")
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const user = validateCredentials(email, password)
    console.log("User validation result:", user ? "Success" : "Failed")

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Create session
    const sessionData = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
    }

    console.log("Creating session for:", sessionData.email)

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      user: sessionData,
      message: "Authentication successful",
    })

    // Set session cookie
    response.cookies.set({
      name: "session",
      value: JSON.stringify(sessionData),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    })

    console.log("Cookie set, returning response")
    return response
  } catch (error) {
    console.error("Sign in error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
