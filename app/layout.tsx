import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SupabaseAuthProvider } from "@/components/providers/supabase-auth-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CloudLeave - Modern Leave Management System",
  description: "Streamlined leave management for modern organizations",
  keywords: "leave management, HR, employee management, vacation tracking",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SupabaseAuthProvider>{children}</SupabaseAuthProvider>
      </body>
    </html>
  )
}
