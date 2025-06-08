import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Get user info from request headers (sent by client)
    const userHeader = request.headers.get("x-user-info")

    if (!userHeader) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    const user = JSON.parse(userHeader)
    const { searchParams } = new URL(request.url)
    const month = Number.parseInt(searchParams.get("month") || "0")
    const year = Number.parseInt(searchParams.get("year") || new Date().getFullYear().toString())

    // Mock calendar data - approved leave requests
    const leaves = [
      {
        id: "1",
        employeeName: "John Employee",
        startDate: "2024-01-15",
        endDate: "2024-01-19",
        type: "ANNUAL",
        status: "APPROVED",
      },
      {
        id: "2",
        employeeName: "Alice Johnson",
        startDate: "2024-01-22",
        endDate: "2024-01-24",
        type: "SICK",
        status: "APPROVED",
      },
      {
        id: "3",
        employeeName: "Mike Wilson",
        startDate: "2024-02-05",
        endDate: "2024-02-07",
        type: "ANNUAL",
        status: "APPROVED",
      },
      {
        id: "4",
        employeeName: "Sarah Davis",
        startDate: "2024-02-12",
        endDate: "2024-02-14",
        type: "EMERGENCY",
        status: "APPROVED",
      },
    ]

    // Filter leaves for the requested month/year
    const filteredLeaves = leaves.filter((leave) => {
      const startDate = new Date(leave.startDate)
      const endDate = new Date(leave.endDate)
      return (
        (startDate.getMonth() === month && startDate.getFullYear() === year) ||
        (endDate.getMonth() === month && endDate.getFullYear() === year) ||
        (startDate <= new Date(year, month, 1) && endDate >= new Date(year, month + 1, 0))
      )
    })

    return NextResponse.json({ leaves: filteredLeaves })
  } catch (error) {
    console.error("Error in calendar API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
