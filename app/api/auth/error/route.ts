import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const error = searchParams.get("error") || "Unknown error"

  console.error("Auth error:", error)

  return NextResponse.json({ error }, { status: 400 })
}
