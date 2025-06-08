import { NextResponse } from "next/server"

export async function POST() {
  try {
    console.log("Signout API called")
    const response = NextResponse.json({ success: true })

    // Clear session cookie
    response.cookies.set({
      name: "session",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    })

    console.log("Session cookie cleared")
    return response
  } catch (error) {
    console.error("Sign out error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
