"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, CreditCard, AlertCircle } from "lucide-react"
import { PaymentMethodCard } from "@/components/subscription/payment-method-card"
import { BillingHistory } from "@/components/subscription/billing-history"
import { getPaymentInfo, formatCurrency, type PaymentInfo } from "@/lib/payment"
import { useSupabaseAuth } from "@/hooks/use-supabase-auth"
import { useRouter } from "next/navigation"

export default function BillingPage() {
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const { user } = useSupabaseAuth()
  const router = useRouter()

  useEffect(() => {
    async function fetchPaymentInfo() {
      if (!user) {
        router.push("/auth/signin")
        return
      }

      try {
        const info = await getPaymentInfo(user.id)
        setPaymentInfo(info)
      } catch (error) {
        console.error("Error fetching payment info:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentInfo()
  }, [user, router])

  const handleManageBilling = async () => {
    setActionLoading(true)
    try {
      const response = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
      })

      if (response.ok) {
        const { url } = await response.json()
        window.location.href = url
      } else {
        throw new Error("Failed to create billing portal session")
      }
    } catch (error) {
      console.error("Error opening billing portal:", error)
      alert("Failed to open billing portal. Please try again.")
    } finally {
      setActionLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getSubscriptionStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "past_due":
        return "bg-yellow-100 text-yellow-800"
      case "canceled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!paymentInfo) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Unable to load billing information. Please try again later.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-12 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Billing & Subscription</h1>
        <p className="text-gray-600">Manage your subscription, payment methods, and billing history.</p>
      </div>

      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Current Subscription</span>
            <Button onClick={handleManageBilling} disabled={actionLoading || !paymentInfo.subscription}>
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CreditCard className="h-4 w-4 mr-2" />
              )}
              Manage Billing
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {paymentInfo.subscription ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Plan</p>
                <p className="text-lg font-semibold capitalize">{paymentInfo.subscription.plan_code}</p>
                <Badge className={getSubscriptionStatusColor(paymentInfo.subscription.status)}>
                  {paymentInfo.subscription.status.charAt(0).toUpperCase() + paymentInfo.subscription.status.slice(1)}
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Current Period</p>
                <p className="text-sm">
                  {formatDate(paymentInfo.subscription.current_period_start)} -{" "}
                  {formatDate(paymentInfo.subscription.current_period_end)}
                </p>
                {paymentInfo.subscription.cancel_at_period_end && (
                  <p className="text-sm text-red-600">Cancels at period end</p>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Next Payment</p>
                {paymentInfo.upcomingInvoice ? (
                  <div>
                    <p className="text-lg font-semibold">{formatCurrency(paymentInfo.upcomingInvoice.amount_due)}</p>
                    <p className="text-sm text-gray-500">
                      Due {formatDate(new Date(paymentInfo.upcomingInvoice.period_end * 1000).toISOString())}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No upcoming payment</p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No active subscription</p>
              <Button onClick={() => router.push("/subscription/plans")}>View Plans</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <PaymentMethodCard
        paymentMethods={paymentInfo.defaultPaymentMethod ? [paymentInfo.defaultPaymentMethod] : []}
        onAddPaymentMethod={handleManageBilling}
        onSetDefault={() => {}}
        onRemove={() => {}}
      />

      {/* Billing History */}
      <BillingHistory invoices={paymentInfo.invoices} />
    </div>
  )
}
