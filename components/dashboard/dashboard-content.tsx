"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, FileText, Plus, Bell } from "lucide-react"
import { LeaveRequestForm } from "@/components/leave/leave-request-form"
import { LeaveCalendar } from "@/components/leave/leave-calendar"
import { ApprovalQueue } from "@/components/leave/approval-queue"
import { ReportsView } from "@/components/leave/reports-view"
import { BusinessSettings } from "@/components/business/business-settings"
import { NotificationCenter } from "@/components/notifications/notification-center"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/ui/logo"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { useLanguage } from "@/hooks/use-language"
import { useSupabaseAuth } from "@/hooks/use-supabase-auth"
import { useNotifications } from "@/hooks/use-notifications"
import type { Database } from "@/lib/supabase/database.types"
import { TrialBanner } from "@/components/subscription/trial-banner"

type UserProfile = Database["public"]["Tables"]["users"]["Row"]

interface DashboardContentProps {
  user: UserProfile
}

function DashboardContentInner({ user }: DashboardContentProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [leaveRequests, setLeaveRequests] = useState([])
  const [pendingApprovals, setPendingApprovals] = useState([])
  const { signOut } = useSupabaseAuth()
  const { unreadCount } = useNotifications()
  const router = useRouter()
  const { language, setLanguage, t } = useLanguage()

  useEffect(() => {
    fetchLeaveData()
  }, [])

  const fetchLeaveData = async () => {
    try {
      const response = await fetch("/api/leave/requests", {
        headers: {
          "x-user-info": JSON.stringify(user),
        },
      })

      if (response.ok) {
        const data = await response.json()
        setLeaveRequests(data.requests || [])
        setPendingApprovals(data.pendingApprovals || [])
      }
    } catch (error) {
      console.error("Error fetching leave data:", error)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/auth/signin")
  }

  const getStatsCards = () => {
    const baseStats = [
      {
        title: t.leaveBalance,
        value: `${user.leave_balance} days`,
        description: t.annualLeaveRemaining,
        icon: Calendar,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      },
      {
        title: t.pendingRequests,
        value: leaveRequests.filter((req) => req.status === "PENDING").length.toString(),
        description: t.awaitingApproval,
        icon: Clock,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
      },
    ]

    if (user.role === "SUPERVISOR" || user.role === "HR" || user.role === "DIRECTOR") {
      baseStats.push({
        title: t.approvalsNeeded,
        value: pendingApprovals.length.toString(),
        description: t.requestsToReview,
        icon: FileText,
        color: "text-red-600",
        bgColor: "bg-red-50",
      })
    }

    if (user.role === "HR" || user.role === "DIRECTOR") {
      baseStats.push({
        title: t.teamMembers,
        value: "24",
        description: t.activeEmployees,
        icon: Users,
        color: "text-green-600",
        bgColor: "bg-green-50",
      })
    }

    return baseStats
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "request":
        return <LeaveRequestForm onSuccess={fetchLeaveData} />
      case "calendar":
        return <LeaveCalendar />
      case "approvals":
        return <ApprovalQueue onUpdate={fetchLeaveData} />
      case "reports":
        return <ReportsView />
      case "settings":
        return <BusinessSettings />
      default:
        return (
          <div className="space-y-6">
            {/* Trial Banner */}
            <TrialBanner />

            {/* Welcome Message */}
            <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-3xl">👋</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {t.welcomeBackUser}, {user.name}!
                    </h2>
                    <p className="text-gray-600 text-lg">
                      {t.loggedInAs} <span className="font-semibold text-blue-600">{user.role}</span> in the{" "}
                      {user.department} department.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {getStatsCards().map((stat, index) => (
                <Card
                  key={index}
                  className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                    <p className="text-sm text-gray-500 mt-1">{stat.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Requests */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">{t.recentLeaveRequests}</CardTitle>
                <CardDescription>{t.latestApplications}</CardDescription>
              </CardHeader>
              <CardContent>
                {leaveRequests.length > 0 ? (
                  <div className="space-y-4">
                    {leaveRequests.slice(0, 5).map((request: any, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <div>
                          <p className="font-semibold text-gray-900">{request.type} Leave</p>
                          <p className="text-sm text-gray-500">
                            {request.startDate} - {request.endDate}
                          </p>
                        </div>
                        <Badge
                          variant={
                            request.status === "APPROVED"
                              ? "default"
                              : request.status === "PENDING"
                                ? "secondary"
                                : "destructive"
                          }
                          className="px-3 py-1"
                        >
                          {request.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">{t.noRequestsFound}</p>
                    <Button
                      onClick={() => setActiveTab("request")}
                      className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t.createFirstRequest}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )
    }
  }

  const getNavigationTabs = () => {
    const baseTabs = [
      { id: "overview", label: t.overview, icon: Calendar },
      { id: "request", label: t.newRequest, icon: Plus },
      { id: "calendar", label: t.calendar, icon: Calendar },
    ]

    if (user.role === "SUPERVISOR" || user.role === "HR" || user.role === "DIRECTOR") {
      baseTabs.push({ id: "approvals", label: t.approvals, icon: Bell })
    }

    if (user.role === "HR" || user.role === "DIRECTOR") {
      baseTabs.push({ id: "reports", label: t.reports, icon: FileText })
    }

    return baseTabs
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header with Logo, Notifications, Language Switcher, and Sign Out */}
      <div className="flex items-center justify-between">
        <Logo />
        <div className="flex items-center space-x-4">
          <NotificationCenter />
          <LanguageSwitcher currentLanguage={language} onLanguageChange={setLanguage} />
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-4">
        {getNavigationTabs().map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "outline"}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center space-x-2"
          >
            {tab.icon && <tab.icon className="h-4 w-4" />}
            <span>{tab.label}</span>
            {tab.id === "approvals" && pendingApprovals.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingApprovals.length}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  )
}

export default DashboardContentInner
