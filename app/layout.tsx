import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SupabaseAuthProvider } from "@/components/providers/supabase-auth-provider"
import { NotificationProvider } from "@/components/notifications/notification-provider"
import { Toaster } from "sonner"

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
        <SupabaseAuthProvider>
          <NotificationProvider>
            {children}
            <Toaster 
              position="top-right" 
              expand={true}
              richColors
              closeButton
              toastOptions={{
                duration: 5000,
                className: "notification-toast",
              }}
            />
          </NotificationProvider>
        </SupabaseAuthProvider>
      </body>
    </html>
  )
}