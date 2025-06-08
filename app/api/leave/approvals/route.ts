import { type NextRequest, NextResponse } from "next/server"
import { createLeaveApprovedNotification, createLeaveRejectedNotification } from "@/lib/notifications"

// Mock database (shared with requests route)
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
    employeeId: "3",
    employeeName: "Alice Johnson",
    type: "SICK",
    startDate: "2024-02-10",
    endDate: "2024-02-12",
    duration: 3,
    reason: "Medical appointment and recovery",
    emergencyContact: "Bob Johnson - 555-0456",
    workHandover: "Urgent tasks covered by supervisor",
    status: "PENDING",
    createdAt: "2024-02-08T09:15:00Z",
  },
  {
    id: "3",
    employeeId: "4",
    employeeName: "Mike Wilson",
    type: "EMERGENCY",
    startDate: "2024-02-15",
    endDate: "2024-02-16",
    duration: 2,
    reason: "Family emergency",
    emergencyContact: "Sarah Wilson - 555-0789",
    workHandover: "Critical meetings rescheduled",
    status: "PENDING",
    createdAt: "2024-02-14T16:45:00Z",
  },
]

export async function GET(request: NextRequest) {
  try {
    // Get user info from request headers
    const userHeader = request.headers.get("x-user-info")

    if (!userHeader) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    const user = JSON.parse(userHeader)

    // Only supervisors, HR, and directors can view approvals
    if (!["SUPERVISOR", "HR", "DIRECTOR"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const pendingRequests = leaveRequests.filter((req) => req.status === "PENDING")

    return NextResponse.json({ requests: pendingRequests })
  } catch (error) {
    console.error("Error in approvals GET:", error)
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

    // Only supervisors, HR, and directors can approve requests
    if (!["SUPERVISOR", "HR", "DIRECTOR"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { requestId, action, comments } = body

    const requestIndex = leaveRequests.findIndex((req) => req.id === requestId)
    if (requestIndex === -1) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    const leaveRequest = leaveRequests[requestIndex]

    // Update request status
    leaveRequests[requestIndex] = {
      ...leaveRequests[requestIndex],
      status: action,
      approvedBy: user.name,
      approvedAt: new Date().toISOString(),
      comments,
    }

    // Create notification for the employee
    const notificationData = {
      employee_name: leaveRequest.employeeName,
      approver_name: user.name,
      leave_type: leaveRequest.type,
      start_date: leaveRequest.startDate,
      end_date: leaveRequest.endDate,
      duration: leaveRequest.duration,
      reason: leaveRequest.reason,
      rejection_reason: comments || "",
    }

    if (action === "APPROVED") {
      await createLeaveApprovedNotification(leaveRequest.employeeId, requestId, notificationData)
    } else if (action === "REJECTED") {
      await createLeaveRejectedNotification(leaveRequest.employeeId, requestId, notificationData)
    }

    return NextResponse.json({
      success: true,
      message: `Request ${action.toLowerCase()} successfully`,
    })
  } catch (error) {
    console.error("Error in approvals POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
