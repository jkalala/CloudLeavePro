"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Clock, User, Calendar } from "lucide-react"

interface ApprovalQueueProps {
  onUpdate: () => void
}

export function ApprovalQueue({ onUpdate }: ApprovalQueueProps) {
  const [pendingRequests, setPendingRequests] = useState([])
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [comments, setComments] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetchPendingRequests()
  }, [])

  const fetchPendingRequests = async () => {
    try {
      // Get current user from localStorage
      const currentUser = localStorage.getItem("currentUser")
      if (!currentUser) {
        console.error("No user found")
        return
      }

      const response = await fetch("/api/leave/approvals", {
        headers: {
          "x-user-info": currentUser,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setPendingRequests(data.requests || [])
    } catch (error) {
      console.error("Error fetching pending requests:", error)
      setPendingRequests([]) // Set empty array on error
    }
  }

  const handleApproval = async (requestId: string, action: "APPROVED" | "REJECTED") => {
    setIsProcessing(true)
    setMessage("")

    try {
      // Get current user from localStorage
      const currentUser = localStorage.getItem("currentUser")
      if (!currentUser) {
        setMessage("User not authenticated")
        setIsProcessing(false)
        return
      }

      const response = await fetch("/api/leave/approvals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-info": currentUser,
        },
        body: JSON.stringify({
          requestId,
          action,
          comments,
        }),
      })

      if (response.ok) {
        setMessage(`Request ${action.toLowerCase()} successfully!`)
        setComments("")
        setSelectedRequest(null)
        fetchPendingRequests()
        onUpdate()
      } else {
        const error = await response.json()
        setMessage(error.message || "Failed to process request")
      }
    } catch (error) {
      console.error("Error processing approval:", error)
      setMessage("An error occurred while processing the request")
    } finally {
      setIsProcessing(false)
    }
  }

  const getLeaveTypeColor = (type: string) => {
    const colors = {
      ANNUAL: "bg-blue-100 text-blue-800",
      SICK: "bg-red-100 text-red-800",
      EMERGENCY: "bg-orange-100 text-orange-800",
      MATERNITY: "bg-pink-100 text-pink-800",
      PATERNITY: "bg-purple-100 text-purple-800",
      UNPAID: "bg-gray-100 text-gray-800",
    }
    return colors[type] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      {message && (
        <Alert variant={message.includes("success") ? "default" : "destructive"}>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Pending Approvals</span>
            <Badge variant="secondary">{pendingRequests.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingRequests.length > 0 ? (
            <div className="space-y-4">
              {pendingRequests.map((request: any) => (
                <div key={request.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{request.employeeName}</span>
                        <Badge className={getLeaveTypeColor(request.type)}>{request.type}</Badge>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {request.startDate} - {request.endDate}
                          </span>
                        </div>
                        <span>({request.duration} days)</span>
                      </div>

                      <div className="text-sm">
                        <strong>Reason:</strong> {request.reason}
                      </div>

                      {request.workHandover && (
                        <div className="text-sm">
                          <strong>Work Handover:</strong> {request.workHandover}
                        </div>
                      )}

                      <div className="text-sm">
                        <strong>Emergency Contact:</strong> {request.emergencyContact}
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      Submitted: {new Date(request.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {selectedRequest === request.id && (
                    <div className="space-y-4 border-t pt-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Comments (optional)</label>
                        <Textarea
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                          placeholder="Add any comments about this decision..."
                          rows={3}
                        />
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedRequest(null)
                            setComments("")
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleApproval(request.id, "REJECTED")}
                          disabled={isProcessing}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                        <Button onClick={() => handleApproval(request.id, "APPROVED")} disabled={isProcessing}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  )}

                  {selectedRequest !== request.id && (
                    <div className="flex justify-end">
                      <Button variant="outline" onClick={() => setSelectedRequest(request.id)}>
                        Review Request
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No pending approvals</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
