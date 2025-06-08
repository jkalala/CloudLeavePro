"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Copy, CheckCircle, AlertCircle } from "lucide-react"
import { Logo } from "@/components/ui/logo"

export default function SetupGuidePage() {
  const [supabaseUrl, setSupabaseUrl] = useState("")
  const [supabaseAnonKey, setSupabaseAnonKey] = useState("")
  const [copied, setCopied] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const generateEnvFile = () => {
    return `NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl || "your-project-url"}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey || "your-anon-key"}
`
  }

  const testConnection = async () => {
    if (!supabaseUrl || !supabaseAnonKey) {
      setTestResult({
        success: false,
        message: "Please enter both Supabase URL and Anon Key to test the connection",
      })
      return
    }

    try {
      const { createClient } = await import("@supabase/supabase-js")
      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      const { error } = await supabase.from("business_configs").select("id").limit(1)

      if (error) {
        setTestResult({
          success: false,
          message: `Connection failed: ${error.message}`,
        })
      } else {
        setTestResult({
          success: true,
          message: "Connection successful! Your Supabase credentials are working.",
        })
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: `Error testing connection: ${error instanceof Error ? error.message : String(error)}`,
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <Logo size="lg" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Supabase Setup Guide</h1>
            <p className="text-gray-600">Configure your Supabase environment for CloudLeave</p>
          </div>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Environment Variables Setup</CardTitle>
            <CardDescription>Follow these steps to configure your Supabase environment variables</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Step 1: Create a Supabase Project</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>
                  Go to{" "}
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Supabase.com
                  </a>{" "}
                  and sign in or create an account
                </li>
                <li>Create a new project and give it a name (e.g., "cloudleave")</li>
                <li>Set a secure database password</li>
                <li>Choose a region closest to your users</li>
                <li>Wait for your project to be created (this may take a few minutes)</li>
              </ol>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Step 2: Get Your API Credentials</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>In your Supabase project dashboard, go to Project Settings (gear icon)</li>
                <li>Click on "API" in the sidebar</li>
                <li>Under "Project URL", copy your project URL</li>
                <li>Under "Project API keys", copy the "anon public" key</li>
              </ol>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Step 3: Configure Environment Variables</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supabaseUrl">Supabase URL</Label>
                  <Input
                    id="supabaseUrl"
                    placeholder="https://your-project-id.supabase.co"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supabaseAnonKey">Supabase Anon Key</Label>
                  <Input
                    id="supabaseAnonKey"
                    placeholder="your-anon-key"
                    value={supabaseAnonKey}
                    onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button onClick={() => testConnection()} className="w-full">
                  Test Connection
                </Button>

                {testResult && (
                  <Alert
                    className={`mt-4 ${testResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
                  >
                    {testResult.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription className={testResult.success ? "text-green-800" : "text-red-800"}>
                      {testResult.message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Step 4: Create .env.local File</h3>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-md relative">
                <pre className="whitespace-pre-wrap text-sm font-mono">{generateEnvFile()}</pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 text-gray-400 hover:text-white"
                  onClick={() => copyToClipboard(generateEnvFile(), "env")}
                >
                  {copied === "env" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-gray-600">
                Create a file named <code className="bg-gray-100 px-1 py-0.5 rounded">.env.local</code> in the root of
                your project and paste the above content.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Step 5: Run Database Setup Scripts</h3>
              <p className="text-gray-700">
                After setting up your environment variables, you need to run the database setup scripts to create the
                necessary tables and seed data.
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Go to the SQL Editor in your Supabase dashboard</li>
                <li>
                  Run the schema script from{" "}
                  <code className="bg-gray-100 px-1 py-0.5 rounded">scripts/supabase-schema-clean.sql</code>
                </li>
                <li>Create users in Supabase Auth (Authentication → Users)</li>
                <li>
                  Update the UUIDs in{" "}
                  <code className="bg-gray-100 px-1 py-0.5 rounded">scripts/supabase-seed-data-fixed.sql</code> with
                  your actual user IDs
                </li>
                <li>Run the updated seed data script</li>
              </ol>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Step 6: Restart Your Development Server</h3>
              <p className="text-gray-700">
                After creating the <code className="bg-gray-100 px-1 py-0.5 rounded">.env.local</code> file, restart
                your development server for the changes to take effect:
              </p>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-md">
                <pre className="whitespace-pre-wrap text-sm font-mono">npm run dev</pre>
              </div>
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
