import { type NextRequest, NextResponse } from "next/server"
import { createCheckoutSession, ensureStripeCustomer } from "@/lib/payment"
import { getSupabaseClient } from "@/lib/supabase/server"
import { getSubscriptionInfo } from "@/lib/subscription"

export async function POST(request: NextRequest) {
  try {
    const { priceId, planCode, billingCycle } = await request.json()

    if (!priceId || !planCode) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const supabase = getSupabaseClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    // Check current subscription status
    const subscriptionInfo = await getSubscriptionInfo(user.id)

    // Ensure Stripe customer exists
    const customerId = await ensureStripeCustomer(user.id, userProfile.email, userProfile.name)

    // Determine if user should get trial (only if they haven't had one before)
    const trialPeriodDays = subscriptionInfo.trialEndDate ? 0 : 14

    // Create checkout session
    const session = await createCheckoutSession({
      customerId,
      priceId,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/plans`,
      trialPeriodDays,
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
