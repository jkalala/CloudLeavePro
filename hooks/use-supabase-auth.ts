"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import type { User } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/supabase/database.types"

type UserProfile = Database["public"]["Tables"]["users"]["Row"]

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (
    email: string,
    password: string,
    userData: Partial<UserProfile>,
  ) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  updatePassword: (password: string) => Promise<{ success: boolean; error?: string }>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useSupabaseAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useSupabaseAuth must be used within an AuthProvider")
  }
  return context
}

export function useSupabaseAuthState() {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = getSupabaseClient()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setUser(session?.user ?? null)

        if (session?.user) {
          await fetchUserProfile(session.user.id)
        }
      } catch (error) {
        console.error("Error getting session:", error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)

      if (session?.user) {
        await fetchUserProfile(session.user.id)
      } else {
        setUserProfile(null)
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

      if (error) {
        console.error("Error fetching user profile:", error)
        return
      }

      setUserProfile(data)
    } catch (error) {
      console.error("Error fetching user profile:", error)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: "An unexpected error occurred" }
    }
  }

  const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        // Wait a moment for the auth state to be established
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Create user profile with retry logic
        let retryCount = 0
        const maxRetries = 3

        while (retryCount < maxRetries) {
          try {
            const { error: profileError } = await supabase.from("users").insert({
              id: data.user.id,
              email,
              ...userData,
            })

            if (!profileError) {
              break // Success, exit retry loop
            }

            if (profileError.code === "42501" || profileError.message.includes("permission denied")) {
              // RLS permission error, wait and retry
              retryCount++
              if (retryCount < maxRetries) {
                await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount))
                continue
              }
            }

            console.error("Error creating user profile:", profileError)
            return { success: false, error: "Failed to create user profile. Please try again." }
          } catch (retryError) {
            retryCount++
            if (retryCount >= maxRetries) {
              console.error("Max retries reached for profile creation:", retryError)
              return { success: false, error: "Failed to create user profile after multiple attempts." }
            }
            await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount))
          }
        }
      }

      return { success: true }
    } catch (error) {
      console.error("Signup error:", error)
      return { success: false, error: "An unexpected error occurred during signup" }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: "An unexpected error occurred" }
    }
  }

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: "An unexpected error occurred" }
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { success: false, error: "No user logged in" }
    }

    try {
      const { error } = await supabase.from("users").update(updates).eq("id", user.id)

      if (error) {
        return { success: false, error: error.message }
      }

      // Refresh user profile
      await fetchUserProfile(user.id)
      return { success: true }
    } catch (error) {
      return { success: false, error: "An unexpected error occurred" }
    }
  }

  return {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
  }
}

export { AuthContext }
