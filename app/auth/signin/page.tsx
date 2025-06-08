"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react"
import { Logo } from "@/components/ui/logo"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { LanguageProvider } from "@/components/providers/language-provider"
import { SupabaseAuthProvider } from "@/components/providers/supabase-auth-provider"
import { useLanguage } from "@/hooks/use-language"
import { useSupabaseAuth } from "@/hooks/use-supabase-auth"

function SignInContent() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()
  const { user, userProfile, signIn } = useSupabaseAuth()
  const { language, setLanguage, t } = useLanguage()

  // Add this check for environment variables
  const isMissingEnvVars =
    typeof window !== "undefined" &&
    (!process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_URL === "https://your-project-id.supabase.co")

  useEffect(() => {
    if (user && userProfile) {
      setSuccess(`${t.welcome}, ${userProfile.name}!`)
      setTimeout(() => {
        router.push("/dashboard")
      }, 1000)
    }
  }, [user, userProfile, router, t])

  // If environment variables are missing, show setup guide
  if (isMissingEnvVars) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Environment Setup Required</CardTitle>
            <CardDescription>Supabase credentials are not configured</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-800">
                Missing Supabase environment variables. Please set up your environment.
              </AlertDescription>
            </Alert>
            <p className="text-gray-600">
              You need to configure your Supabase environment variables before using authentication features.
            </p>
            <Link href="/auth/setup-guide">
              <Button className="w-full">View Setup Guide</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    const result = await signIn(email, password)

    if (result.success) {
      setSuccess(`${t.welcome}!`)
      setTimeout(() => {
        router.push("/dashboard")
      }, 1000)
    } else {
      setError(result.error || "Sign in failed")
    }

    setIsLoading(false)
  }

  const quickLogin = async (userEmail: string) => {
    setIsLoading(true)
    setError("")
    setSuccess("")

    const result = await signIn(userEmail, "password123")

    if (result.success) {
      setSuccess(`${t.welcome}!`)
      setTimeout(() => {
        router.push("/dashboard")
      }, 1000)
    } else {
      setError(result.error || "Quick login failed")
    }

    setIsLoading(false)
  }

  const demoAccounts = [
    {
      email: "employee@adpa.com",
      name: "John Employee",
      role: t.employee,
      icon: "👤",
      color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
    },
    {
      email: "supervisor@adpa.com",
      name: "Jane Supervisor",
      role: t.supervisor,
      icon: "🛡️",
      color: "bg-green-50 border-green-200 hover:bg-green-100",
    },
    {
      email: "hr@adpa.com",
      name: "HR Manager",
      role: t.hrManager,
      icon: "🏢",
      color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
    },
    {
      email: "director@adpa.com",
      name: "Executive Director",
      role: t.director,
      icon: "🎯",
      color: "bg-orange-50 border-orange-200 hover:bg-orange-100",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Language Switcher */}
        <div className="flex justify-end">
          <LanguageSwitcher currentLanguage={language} onLanguageChange={setLanguage} variant="button" />
        </div>

        {/* Header */}
        <div className="text-center space-y-4">
          <Link href="/" className="inline-block">
            <Logo size="lg" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t.welcomeBack}</h1>
            <p className="text-gray-600">{t.signInToAccount}</p>
          </div>
        </div>

        {/* Main Sign In Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-center">{t.signIn}</CardTitle>
            <CardDescription className="text-center">Enter your credentials to continue</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="social">Social Login</TabsTrigger>
              </TabsList>
              <TabsContent value="email">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      {t.email}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.email}
                      required
                      disabled={isLoading}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-sm font-medium">
                        {t.password}
                      </Label>
                      <Link
                        href="/auth/reset-password"
                        className="text-xs font-medium text-blue-600 hover:text-blue-500"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t.password}
                      required
                      disabled={isLoading}
                      className="h-11"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoading ? t.signingIn : t.signIn}
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="social">
                <div className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full h-11 flex items-center justify-center"
                    disabled={isLoading}
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06 06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-11 flex items-center justify-center"
                    disabled={isLoading}
                  >
                    <svg className="w-5 h-5 mr-2 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Continue with Facebook
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-11 flex items-center justify-center"
                    disabled={isLoading}
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    Continue with GitHub
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center text-sm">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo Accounts */}
        <Card className="shadow-lg border-0 bg-white/60 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-center">{t.demoAccounts}</CardTitle>
            <CardDescription className="text-center text-sm">{t.tryDifferentRoles}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {demoAccounts.map((account) => (
              <Button
                key={account.email}
                variant="outline"
                className={`w-full h-12 justify-start text-left border-2 transition-all duration-200 ${account.color}`}
                onClick={() => quickLogin(account.email)}
                disabled={isLoading}
              >
                <span className="text-xl mr-3">{account.icon}</span>
                <div className="flex-1">
                  <div className="font-medium text-sm">{account.name}</div>
                  <div className="text-xs text-gray-600">{account.role}</div>
                </div>
              </Button>
            ))}
            <div className="text-center">
              <p className="text-xs text-gray-500 mt-3">
                All demo accounts use password: <span className="font-mono bg-gray-100 px-1 rounded">password123</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function SignIn() {
  return (
    <SupabaseAuthProvider>
      <LanguageProvider>
        <SignInContent />
      </LanguageProvider>
    </SupabaseAuthProvider>
  )
}
