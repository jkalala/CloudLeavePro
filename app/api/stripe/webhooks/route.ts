import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { stripe } from "@/lib/stripe"
import { createSubscriptionRecord, updateSubscriptionRecord, createInvoiceRecord } from "@/lib/payment"
import { getSupabaseClient } from "@/lib/supabase/server"

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = headers()
  const signature = headersList.get("stripe-signature")!

  let event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const supabase = getSupabaseClient()

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object

        if (session.mode === "subscription") {
          // Get the subscription
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

          // Get plan code from price ID
          const { data: plan } = await supabase
            .from("subscription_plans")
            .select("code")
            .or(
              `stripe_price_id_monthly.eq.${subscription.items.data[0].price.id},stripe_price_id_yearly.eq.${subscription.items.data[0].price.id}`,
            )
            .single()

          if (plan) {
            // Find user by customer ID or email
            const customer = await stripe.customers.retrieve(session.customer as string)
            const { data: user } = await supabase
              .from("users")
              .select("id")
              .eq("email", (customer as any).email)
              .single()

            if (user) {
              await createSubscriptionRecord(user.id, subscription, plan.code)
            }
          }
        }
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object
        await updateSubscriptionRecord(subscription)
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object

        // Update subscription status to canceled
        await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
            canceled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id)

        // Update user status
        const { data: subRecord } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", subscription.id)
          .single()

        if (subRecord) {
          await supabase
            .from("users")
            .update({
              subscription_status: "canceled",
              subscription_plan: "free",
            })
            .eq("id", subRecord.user_id)
        }
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object
        await createInvoiceRecord(invoice)
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object

        // Update subscription status if payment failed
        if (invoice.subscription) {
          await supabase
            .from("subscriptions")
            .update({ status: "past_due" })
            .eq("stripe_subscription_id", invoice.subscription)
        }

        await createInvoiceRecord(invoice)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
