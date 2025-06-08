import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

// Fallback handlers
export async function fallbackGET() {
  return new Response(JSON.stringify({ error: "Authentication service unavailable" }), {
    status: 500,
    headers: { "Content-Type": "application/json" },
  })
}

export async function fallbackPOST() {
  return new Response(JSON.stringify({ error: "Authentication service unavailable" }), {
    status: 500,
    headers: { "Content-Type": "application/json" },
  })
}
