import { getSupabaseClient } from "@/lib/supabase/client"

export type SubscriptionStatus = "trial" | "active" | "expired" | "canceled"
export type SubscriptionPlan = "free" | "starter" | "professional" | "enterprise"

export interface SubscriptionInfo {
  status: SubscriptionStatus
  plan: SubscriptionPlan
  trialDaysLeft: number | null
  trialEndDate: Date | null
  isTrialActive: boolean
  features: string[]
}

export async function getSubscriptionInfo(userId: string): Promise<SubscriptionInfo> {
  const supabase = getSupabaseClient()

  // Get user subscription data
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("subscription_status, subscription_plan, trial_start_date, trial_end_date")
    .eq("id", userId)
    .single()

  if (userError || !userData) {
    console.error("Error fetching subscription data:", userError)
    return {
      status: "trial",
      plan: "free",
      trialDaysLeft: null,
      trialEndDate: null,
      isTrialActive: false,
      features: [],
    }
  }

  // Get plan features
  const { data: planData } = await supabase
    .from("subscription_plans")
    .select("features")
    .eq("code", userData.subscription_plan)
    .single()

  const features = (planData?.features as string[]) || []

  // Calculate trial days left
  let trialDaysLeft: number | null = null
  let trialEndDate: Date | null = null
  let isTrialActive = false

  if (userData.trial_end_date) {
    trialEndDate = new Date(userData.trial_end_date)
    const now = new Date()

    // Calculate days left in trial
    const diffTime = trialEndDate.getTime() - now.getTime()
    trialDaysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    // Check if trial is active
    isTrialActive = trialDaysLeft > 0 && userData.subscription_status === "trial"

    // If trial has expired but status hasn't been updated
    if (trialDaysLeft <= 0 && userData.subscription_status === "trial") {
      // Update user status to expired
      await supabase.from("users").update({ subscription_status: "expired" }).eq("id", userId)

      userData.subscription_status = "expired"
    }
  }

  return {
    status: userData.subscription_status as SubscriptionStatus,
    plan: userData.subscription_plan as SubscriptionPlan,
    trialDaysLeft,
    trialEndDate,
    isTrialActive,
    features,
  }
}

export async function startFreeTrial(userId: string, businessId = "adpa"): Promise<boolean> {
  const supabase = getSupabaseClient()

  try {
    // Get trial days from business config
    const { data: configData } = await supabase
      .from("business_configs")
      .select("trial_days")
      .eq("id", businessId)
      .single()

    const trialDays = configData?.trial_days || 14
    const trialStartDate = new Date()
    const trialEndDate = new Date()
    trialEndDate.setDate(trialEndDate.getDate() + trialDays)

    // Update user with trial information
    const { error } = await supabase
      .from("users")
      .update({
        trial_start_date: trialStartDate.toISOString(),
        trial_end_date: trialEndDate.toISOString(),
        subscription_status: "trial",
        subscription_plan: "professional", // Start with professional plan for trial
      })
      .eq("id", userId)

    if (error) {
      console.error("Error starting free trial:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in startFreeTrial:", error)
    return false
  }
}

export async function upgradePlan(userId: string, plan: SubscriptionPlan): Promise<boolean> {
  const supabase = getSupabaseClient()

  try {
    const { error } = await supabase
      .from("users")
      .update({
        subscription_plan: plan,
        subscription_status: "active",
      })
      .eq("id", userId)

    if (error) {
      console.error("Error upgrading plan:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in upgradePlan:", error)
    return false
  }
}
