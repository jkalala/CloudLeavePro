import { getSupabaseClient } from "@/lib/supabase/client"
import { stripe, createStripeCustomer, getStripeCustomerByEmail } from "@/lib/stripe"
import type { Database } from "@/lib/supabase/database.types"

type PaymentMethod = Database["public"]["Tables"]["payment_methods"]["Row"]
type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"]
type Invoice = Database["public"]["Tables"]["invoices"]["Row"]

export interface PaymentInfo {
  hasPaymentMethod: boolean
  defaultPaymentMethod: PaymentMethod | null
  subscription: Subscription | null
  upcomingInvoice: any
  invoices: Invoice[]
}

export async function getPaymentInfo(userId: string): Promise<PaymentInfo> {
  const supabase = getSupabaseClient()

  try {
    // Get user's payment methods
    const { data: paymentMethods } = await supabase
      .from("payment_methods")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    const defaultPaymentMethod = paymentMethods?.find((pm) => pm.is_default) || paymentMethods?.[0] || null

    // Get user's subscription
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .single()

    // Get user's invoices
    const { data: invoices } = await supabase
      .from("invoices")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10)

    // Get upcoming invoice from Stripe if subscription exists
    let upcomingInvoice = null
    if (subscription?.stripe_customer_id) {
      try {
        upcomingInvoice = await stripe.invoices.retrieveUpcoming({
          customer: subscription.stripe_customer_id,
        })
      } catch (error) {
        console.log("No upcoming invoice found")
      }
    }

    return {
      hasPaymentMethod: !!defaultPaymentMethod,
      defaultPaymentMethod,
      subscription,
      upcomingInvoice,
      invoices: invoices || [],
    }
  } catch (error) {
    console.error("Error fetching payment info:", error)
    return {
      hasPaymentMethod: false,
      defaultPaymentMethod: null,
      subscription: null,
      upcomingInvoice: null,
      invoices: [],
    }
  }
}

export async function ensureStripeCustomer(userId: string, email: string, name: string): Promise<string> {
  const supabase = getSupabaseClient()

  // Check if user already has a Stripe customer ID
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .single()

  if (subscription?.stripe_customer_id) {
    return subscription.stripe_customer_id
  }

  // Check if customer exists in Stripe by email
  let customer = await getStripeCustomerByEmail(email)

  // Create new customer if doesn't exist
  if (!customer) {
    customer = await createStripeCustomer(email, name)
  }

  return customer.id
}

export async function createSubscriptionRecord(
  userId: string,
  stripeSubscription: any,
  planCode: string,
): Promise<void> {
  const supabase = getSupabaseClient()

  const subscriptionData = {
    user_id: userId,
    stripe_subscription_id: stripeSubscription.id,
    stripe_customer_id: stripeSubscription.customer,
    plan_code: planCode,
    status: stripeSubscription.status,
    current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: stripeSubscription.cancel_at_period_end,
    trial_start: stripeSubscription.trial_start ? new Date(stripeSubscription.trial_start * 1000).toISOString() : null,
    trial_end: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000).toISOString() : null,
  }

  // Insert or update subscription
  const { error } = await supabase.from("subscriptions").upsert(subscriptionData, {
    onConflict: "stripe_subscription_id",
  })

  if (error) {
    console.error("Error creating subscription record:", error)
    throw error
  }

  // Update user's subscription status
  await supabase
    .from("users")
    .update({
      subscription_status: stripeSubscription.status,
      subscription_plan: planCode,
    })
    .eq("id", userId)
}

export async function updateSubscriptionRecord(stripeSubscription: any): Promise<void> {
  const supabase = getSupabaseClient()

  const updateData = {
    status: stripeSubscription.status,
    current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: stripeSubscription.cancel_at_period_end,
    canceled_at: stripeSubscription.canceled_at ? new Date(stripeSubscription.canceled_at * 1000).toISOString() : null,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from("subscriptions")
    .update(updateData)
    .eq("stripe_subscription_id", stripeSubscription.id)

  if (error) {
    console.error("Error updating subscription record:", error)
    throw error
  }
}

export async function createInvoiceRecord(stripeInvoice: any): Promise<void> {
  const supabase = getSupabaseClient()

  // Get subscription to find user_id
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id, user_id")
    .eq("stripe_subscription_id", stripeInvoice.subscription)
    .single()

  if (!subscription) {
    console.error("Subscription not found for invoice:", stripeInvoice.id)
    return
  }

  const invoiceData = {
    user_id: subscription.user_id,
    subscription_id: subscription.id,
    stripe_invoice_id: stripeInvoice.id,
    amount_paid: stripeInvoice.amount_paid,
    amount_due: stripeInvoice.amount_due,
    currency: stripeInvoice.currency,
    status: stripeInvoice.status,
    invoice_pdf: stripeInvoice.invoice_pdf,
    hosted_invoice_url: stripeInvoice.hosted_invoice_url,
    invoice_number: stripeInvoice.number,
    period_start: stripeInvoice.period_start ? new Date(stripeInvoice.period_start * 1000).toISOString() : null,
    period_end: stripeInvoice.period_end ? new Date(stripeInvoice.period_end * 1000).toISOString() : null,
    due_date: stripeInvoice.due_date ? new Date(stripeInvoice.due_date * 1000).toISOString() : null,
    paid_at: stripeInvoice.status_transitions?.paid_at
      ? new Date(stripeInvoice.status_transitions.paid_at * 1000).toISOString()
      : null,
  }

  const { error } = await supabase.from("invoices").upsert(invoiceData, {
    onConflict: "stripe_invoice_id",
  })

  if (error) {
    console.error("Error creating invoice record:", error)
    throw error
  }
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount / 100)
}
