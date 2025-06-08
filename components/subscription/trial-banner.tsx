"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Clock, AlertCircle } from "lucide-react"
import Link from "next/link"
import { getSubscriptionInfo, type SubscriptionInfo } from "@/lib/subscription"
import { useSupabaseAuth } from "@/hooks/use-supabase-auth"

export function TrialBanner() {
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useSupabaseAuth()

  useEffect(() => {
    async function fetchSubscriptionInfo() {
      if (!user) return

      try {
        const info = await getSubscriptionInfo(user.id)
        setSubscriptionInfo(info)
      } catch (error) {
        console.error("Error fetching subscription info:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSubscriptionInfo()
  }, [user])

  if (loading || !subscriptionInfo) {
    return null
  }

  // Don't show banner for active subscriptions
  if (subscriptionInfo.status === "active") {
    return null
  }

  // Trial expired banner
  if (subscriptionInfo.status === "expired") {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between w-full">
          <span>Your free trial has expired. Upgrade now to continue using all features.</span>
          <Link href="/subscription/plans">
            <Button size="sm" variant="outline" className="ml-4 bg-white">
              Upgrade Now
            </Button>
          </Link>
        </AlertDescription>
      </Alert>
    )
  }

  // Active trial banner
  if (subscriptionInfo.isTrialActive && subscriptionInfo.trialDaysLeft !== null) {
    return (
      <Alert className="mb-4 bg-blue-50 border-blue-200">
        <Clock className="h-4 w-4 text-blue-600" />
        <AlertDescription className="flex items-center justify-between w-full text-blue-800">
          <span>
            Your free trial ends in <strong>{subscriptionInfo.trialDaysLeft} days</strong>. Enjoying CloudLeave?
          </span>
          <Link href="/subscription/plans">
            <Button size="sm" variant="default" className="ml-4">
              Upgrade Plan
            </Button>
          </Link>
        </AlertDescription>
      </Alert>
    )
  }

  return null
}
