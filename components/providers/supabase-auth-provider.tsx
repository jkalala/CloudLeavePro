"use client"

import type React from "react"
import { AuthContext, useSupabaseAuthState } from "@/hooks/use-supabase-auth"

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const authState = useSupabaseAuthState()

  return <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>
}
