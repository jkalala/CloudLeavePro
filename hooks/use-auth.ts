"use client"

import { useState, useEffect } from "react"
import type { User } from "@/lib/auth"
import { getCurrentUser, setCurrentUser, clearCurrentUser, validateCredentials } from "@/lib/auth"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing user in localStorage
    const existingUser = getCurrentUser()
    setUser(existingUser)
    setLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const validatedUser = validateCredentials(email, password)

      if (validatedUser) {
        setCurrentUser(validatedUser)
        setUser(validatedUser)
        return { success: true, user: validatedUser }
      } else {
        return { success: false, error: "Invalid email or password" }
      }
    } catch (error) {
      return { success: false, error: "Authentication failed" }
    }
  }

  const signOut = () => {
    clearCurrentUser()
    setUser(null)
    return { success: true }
  }

  return {
    user,
    loading,
    signIn,
    signOut,
  }
}
