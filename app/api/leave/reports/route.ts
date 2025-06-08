import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Get user info from request headers
    const userHeader = request.headers.get("x-user-info")

    if (!userHeader) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    const user = JSON.parse(userHeader)

    // Only HR and directors can view reports
    if (!["HR", "DIRECTOR"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "current-month"
    const department = searchParams.get("department") || "all"

    // Mock report data
    const reportData = {
      summary: {
        totalRequests: 45,
        approvedRequests: 38,
        pendingRequests: 4,
        rejectedRequests: 3,
        averageProcessingTime: 2.5,
      },
      leaveTypes: [
        { type: "ANNUAL", count: 25 },
        { type: "SICK", count: 12 },
        { type: "EMERGENCY", count: 5 },
        { type: "MATERNITY", count: 2 },
        { type: "PATERNITY", count: 1 },
      ],
      monthlyTrends: [
        { month: "Jan", requests: 15 },
        { month: "Feb", requests: 18 },
        { month: "Mar", requests: 12 },
      ],
      departmentStats: [
        {
          department: "IT",
          totalRequests: 18,
          approved: 15,
          pending: 2,
          rejected: 1,
          averageDays: 3.2,
        },
        {
          department: "HR",
          totalRequests: 12,
          approved: 11,
          pending: 1,
          rejected: 0,
          averageDays: 2.8,
        },
        {
          department: "Finance",
          totalRequests: 10,
          approved: 8,
          pending: 1,
          rejected: 1,
          averageDays: 2.1,
        },
        {
          department: "Operations",
          totalRequests: 5,
          approved: 4,
          pending: 0,
          rejected: 1,
          averageDays: 1.9,
        },
      ],
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error("Error in reports API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
