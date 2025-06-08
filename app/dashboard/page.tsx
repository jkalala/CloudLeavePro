"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import DashboardContent from "@/components/dashboard/dashboard-content"
import { SupabaseAuthProvider } from "@/components/providers/supabase-auth-provider"
import { useSupabaseAuth } from "@/hooks/use-supabase-auth"

function DashboardPage() {
  const { user, userProfile, loading } = useSupabaseAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="text-sm text-gray-600">Loading dashboard...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <p className="text-sm text-gray-600">Redirecting to sign in...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <DashboardContent user={userProfile} />
}

export default function Dashboard() {
  return (
    <SupabaseAuthProvider>
      <DashboardPage />
    </SupabaseAuthProvider>
  )
}
