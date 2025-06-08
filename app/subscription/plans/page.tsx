"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, X, AlertCircle } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { getSubscriptionInfo } from "@/lib/subscription"
import { useSupabaseAuth } from "@/hooks/use-supabase-auth"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PlanFeature {
  name: string
  description: string
  included: boolean
}

interface Plan {
  id: number
  name: string
  code: string
  priceMonthly: number
  priceYearly: number
  stripePriceIdMonthly: string
  stripePriceIdYearly: string
  features: PlanFeature[]
  isPopular?: boolean
}

export default function SubscriptionPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
  const [upgradeStatus, setUpgradeStatus] = useState<{ success?: boolean; message?: string } | null>(null)
  const { user } = useSupabaseAuth()
  const router = useRouter()
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    async function fetchPlans() {
      if (!user) {
        router.push("/auth/signin")
        return
      }

      try {
        const supabase = getSupabaseClient()
        const { data: plansData, error } = await supabase
          .from("subscription_plans")
          .select("*")
          .eq("is_active", true)
          .order("price_monthly", { ascending: true })

        if (error) throw error

        // Get current subscription info
        const subscriptionInfo = await getSubscriptionInfo(user.id)
        setCurrentPlan(subscriptionInfo.plan)

        // Map database plans to UI plans with feature details
        const mappedPlans = plansData.map((plan) => {
          const allFeatures = getAllFeatures()
          const planFeatures = plan.features as string[]

          const features = allFeatures.map((feature) => ({
            ...feature,
            included: planFeatures.includes(feature.id) || planFeatures.includes("all"),
          }))

          return {
            id: plan.id,
            name: plan.name,
            code: plan.code,
            priceMonthly: plan.price_monthly,
            priceYearly: plan.price_yearly,
            stripePriceIdMonthly: plan.stripe_price_id_monthly,
            stripePriceIdYearly: plan.stripe_price_id_yearly,
            features,
            isPopular: plan.code === "professional",
          }
        })

        setPlans(mappedPlans)
      } catch (error) {
        console.error("Error fetching subscription plans:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [user, router])

  const handleUpgrade = async (planCode: string, priceId: string) => {
    if (!user) return

    setUpgradeStatus(null)
    setActionLoading(true)

    try {
      // Create Stripe checkout session
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          planCode,
          billingCycle,
        }),
      })

      if (response.ok) {
        const { url } = await response.json()
        window.location.href = url
      } else {
        throw new Error("Failed to create checkout session")
      }
    } catch (error) {
      setUpgradeStatus({
        success: false,
        message: "Failed to start checkout. Please try again.",
      })
    } finally {
      setActionLoading(false)
    }
  }

  // Helper function to get all possible features
  function getAllFeatures() {
    return [
      { id: "basic_leave_management", name: "Basic Leave Management", description: "Request and approve leave" },
      { id: "5_users", name: "5 Users", description: "Up to 5 user accounts" },
      { id: "25_users", name: "25 Users", description: "Up to 25 user accounts" },
      { id: "unlimited_users", name: "Unlimited Users", description: "No limit on user accounts" },
      { id: "advanced_reporting", name: "Advanced Reporting", description: "Detailed leave analytics" },
      { id: "email_notifications", name: "Email Notifications", description: "Automated email alerts" },
      { id: "calendar_integration", name: "Calendar Integration", description: "Sync with external calendars" },
      { id: "custom_workflows", name: "Custom Workflows", description: "Create custom approval flows" },
      { id: "api_access", name: "API Access", description: "Access to CloudLeave API" },
      { id: "priority_support", name: "Priority Support", description: "24/7 priority customer support" },
    ]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user && !loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please sign in to view subscription plans.</p>
          <Button onClick={() => router.push("/auth/signin")}>Sign In</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Select the plan that best fits your organization's needs. All plans include our core leave management
          features.
        </p>

        {upgradeStatus && (
          <Alert
            className={`mt-6 mx-auto max-w-md ${
              upgradeStatus.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
            }`}
          >
            {upgradeStatus.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={upgradeStatus.success ? "text-green-800" : "text-red-800"}>
              {upgradeStatus.message}
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="flex justify-center mb-8">
        <Tabs defaultValue="monthly" className="w-full max-w-md">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="monthly" onClick={() => setBillingCycle("monthly")}>
              Monthly Billing
            </TabsTrigger>
            <TabsTrigger value="yearly" onClick={() => setBillingCycle("yearly")}>
              Yearly Billing <Badge className="ml-2 bg-green-100 text-green-800">Save 15%</Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {plans.map((plan) => (
          <Card
            key={plan.code}
            className={`relative ${plan.isPopular ? "border-blue-400 shadow-lg" : "border-gray-200"}`}
          >
            {plan.isPopular && (
              <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                <Badge className="bg-blue-500">Most Popular</Badge>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.code === "free" ? "Limited functionality" : "Full-featured plan"}</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">
                  ${billingCycle === "monthly" ? plan.priceMonthly : plan.priceYearly}
                </span>
                <span className="text-gray-500">/{billingCycle === "monthly" ? "month" : "year"}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <h4 className="font-medium text-sm text-gray-500 uppercase">Features</h4>
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    {feature.included ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-gray-300 mr-2 shrink-0" />
                    )}
                    <span className={feature.included ? "text-gray-700" : "text-gray-400"}>{feature.name}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className={`w-full ${
                  currentPlan === plan.code
                    ? "bg-green-600 hover:bg-green-700"
                    : plan.isPopular
                      ? "bg-blue-600 hover:bg-blue-700"
                      : ""
                }`}
                disabled={currentPlan === plan.code || actionLoading}
                onClick={() =>
                  handleUpgrade(
                    plan.code,
                    billingCycle === "monthly" ? plan.stripePriceIdMonthly : plan.stripePriceIdYearly,
                  )
                }
                isLoading={actionLoading}
              >
                {currentPlan === plan.code ? "Current Plan" : "Select Plan"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
