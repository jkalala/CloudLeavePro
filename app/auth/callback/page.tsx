"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase/client"

export default function AuthCallback() {
  const router = useRouter()
  const supabase = getSupabaseClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Auth callback error:", error)
          router.push("/auth/signin?error=callback_error")
          return
        }

        if (data.session) {
          // User is authenticated, redirect to dashboard
          router.push("/dashboard")
        } else {
          // No session, redirect to sign in
          router.push("/auth/signin")
        }
      } catch (error) {
        console.error("Unexpected error in auth callback:", error)
        router.push("/auth/signin?error=unexpected_error")
      }
    }

    handleAuthCallback()
  }, [router, supabase.auth])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-sm text-gray-600">Completing authentication...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
