import { type NextRequest, NextResponse } from "next/server"
import { createLeaveRequestNotification, createApprovalRequiredNotification } from "@/lib/notifications"

// Mock database - in production this would be a real database
const leaveRequests = [
  {
    id: "1",
    employeeId: "1",
    employeeName: "John Employee",
    type: "ANNUAL",
    startDate: "2024-01-15",
    endDate: "2024-01-19",
    duration: 5,
    reason: "Family vacation",
    emergencyContact: "Jane Doe - 555-0123",
    workHandover: "Tasks delegated to team members",
    status: "APPROVED",
    createdAt: "2024-01-01T10:00:00Z",
    approvedBy: "Jane Supervisor",
    approvedAt: "2024-01-02T14:30:00Z",
  },
  {
    id: "2",
    employeeId: "1",
    employeeName: "John Employee",
    type: "SICK",
    startDate: "2024-02-10",
    endDate: "2024-02-12",
    duration: 3,
    reason: "Medical appointment",
    emergencyContact: "Jane Doe - 555-0123",
    workHandover: "Urgent tasks covered by supervisor",
    status: "PENDING",
    createdAt: "2024-02-08T09:15:00Z",
  },
]

export async function GET(request: NextRequest) {
  try {
    // Get user info from request headers (sent by client)
    const userHeader = request.headers.get("x-user-info")

    if (!userHeader) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    const user = JSON.parse(userHeader)

    // Filter requests based on user role
    let filteredRequests = leaveRequests
    if (user.role === "EMPLOYEE") {
      filteredRequests = leaveRequests.filter((req) => req.employeeId === user.id)
    }

    // Get pending approvals for supervisors/HR/directors
    let pendingApprovals = []
    if (["SUPERVISOR", "HR", "DIRECTOR"].includes(user.role)) {
      pendingApprovals = leaveRequests.filter((req) => req.status === "PENDING")
    }

    return NextResponse.json({
      requests: filteredRequests,
      pendingApprovals,
    })
  } catch (error) {
    console.error("Error in GET /api/leave/requests:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user info from request headers
    const userHeader = request.headers.get("x-user-info")

    if (!userHeader) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    const user = JSON.parse(userHeader)
    const body = await request.json()
    const { type, startDate, endDate, reason, emergencyContact, workHandover } = body

    // Validate required fields
    if (!type || !startDate || !endDate || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Calculate duration
    const start = new Date(startDate)
    const end = new Date(endDate)
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

    // Create new leave request
    const newRequest = {
      id: (leaveRequests.length + 1).toString(),
      employeeId: user.id,
      employeeName: user.name,
      type,
      startDate,
      endDate,
      duration,
      reason,
      emergencyContact: emergencyContact || "",
      workHandover: workHandover || "",
      status: "PENDING",
      createdAt: new Date().toISOString(),
    }

    leaveRequests.push(newRequest)

    console.log("New leave request created:", newRequest)

    // Create notification for the employee
    await createLeaveRequestNotification(user.id, newRequest.id, {
      employee_name: user.name,
      leave_type: type,
      start_date: startDate,
      end_date: endDate,
      duration: duration,
      reason: reason,
    })

    // Create notification for supervisor/manager (mock - find supervisor)
    // In a real app, you'd query the database for the user's supervisor
    const supervisorId = "2" // Mock supervisor ID
    await createApprovalRequiredNotification(supervisorId, newRequest.id, {
      employee_name: user.name,
      approver_name: "Supervisor", // Would be fetched from database
      leave_type: type,
      start_date: startDate,
      end_date: endDate,
      duration: duration,
      reason: reason,
    })

    return NextResponse.json({
      success: true,
      request: newRequest,
      message: "Leave request submitted successfully!",
    })
  } catch (error) {
    console.error("Error in POST /api/leave/requests:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
