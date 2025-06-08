"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, FileText, CheckCircle, Calendar, User, Phone } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

interface LeaveRequestFormProps {
  onSuccess: () => void
}

export function LeaveRequestForm({ onSuccess }: LeaveRequestFormProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    type: "",
    startDate: "",
    endDate: "",
    reason: "",
    emergencyContact: "",
    workHandover: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error">("error")

  const leaveTypes = [
    { value: "ANNUAL", label: "Annual Leave", color: "bg-blue-100 text-blue-800", icon: "🏖️" },
    { value: "SICK", label: "Sick Leave", color: "bg-red-100 text-red-800", icon: "🏥" },
    { value: "EMERGENCY", label: "Emergency Leave", color: "bg-orange-100 text-orange-800", icon: "🚨" },
    { value: "MATERNITY", label: "Maternity Leave", color: "bg-pink-100 text-pink-800", icon: "👶" },
    { value: "PATERNITY", label: "Paternity Leave", color: "bg-purple-100 text-purple-800", icon: "👨‍👶" },
    { value: "UNPAID", label: "Unpaid Leave", color: "bg-gray-100 text-gray-800", icon: "💼" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage("")

    try {
      if (!user) {
        setMessage("You must be logged in to submit a leave request")
        setMessageType("error")
        setIsSubmitting(false)
        return
      }

      if (!formData.type || !formData.startDate || !formData.endDate || !formData.reason) {
        setMessage("Please fill in all required fields")
        setMessageType("error")
        setIsSubmitting(false)
        return
      }

      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        setMessage("End date must be after start date")
        setMessageType("error")
        setIsSubmitting(false)
        return
      }

      const response = await fetch("/api/leave/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-info": JSON.stringify(user),
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(data.message || "Leave request submitted successfully!")
        setMessageType("success")
        setFormData({
          type: "",
          startDate: "",
          endDate: "",
          reason: "",
          emergencyContact: "",
          workHandover: "",
        })
        onSuccess()
      } else {
        setMessage(data.error || "Failed to submit leave request")
        setMessageType("error")
      }
    } catch (error) {
      console.error("Error submitting leave request:", error)
      setMessage("An error occurred while submitting the request. Please try again.")
      setMessageType("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculateDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      return diffDays
    }
    return 0
  }

  if (!user) {
    return (
      <Card className="max-w-2xl mx-auto border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Please log in to submit a leave request.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-4xl mx-auto border-0 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
        <CardTitle className="flex items-center space-x-3 text-2xl">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            New Leave Request
          </span>
        </CardTitle>
        <CardDescription className="text-lg">Submit a new leave request for approval</CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {message && (
            <Alert variant={messageType === "success" ? "default" : "destructive"} className="border-0 shadow-md">
              {messageType === "success" && <CheckCircle className="h-5 w-5" />}
              <AlertDescription className="text-base">{message}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="type" className="text-base font-semibold">
                  Leave Type *
                </Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-500">
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center space-x-2">
                          <span>{type.icon}</span>
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">Duration</Label>
                <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-100">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="text-lg font-semibold text-blue-800">
                    {calculateDays()} {calculateDays() === 1 ? "day" : "days"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="startDate" className="text-base font-semibold flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Start Date *</span>
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                    min={new Date().toISOString().split("T")[0]}
                    className="h-12 border-2 border-gray-200 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="endDate" className="text-base font-semibold flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>End Date *</span>
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    min={formData.startDate || new Date().toISOString().split("T")[0]}
                    required
                    className="h-12 border-2 border-gray-200 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="reason" className="text-base font-semibold">
              Reason for Leave *
            </Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Please provide a brief reason for your leave request"
              rows={4}
              required
              className="border-2 border-gray-200 focus:border-blue-500 resize-none"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="emergencyContact" className="text-base font-semibold flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>Emergency Contact</span>
            </Label>
            <Input
              id="emergencyContact"
              value={formData.emergencyContact}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              placeholder="Name and phone number"
              className="h-12 border-2 border-gray-200 focus:border-blue-500"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="workHandover" className="text-base font-semibold">
              Work Handover Details
            </Label>
            <Textarea
              id="workHandover"
              value={formData.workHandover}
              onChange={(e) => setFormData({ ...formData, workHandover: e.target.value })}
              placeholder="Describe how your work will be handled during your absence"
              rows={4}
              className="border-2 border-gray-200 focus:border-blue-500 resize-none"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              className="px-8 py-3 h-12"
              onClick={() =>
                setFormData({
                  type: "",
                  startDate: "",
                  endDate: "",
                  reason: "",
                  emergencyContact: "",
                  workHandover: "",
                })
              }
            >
              Clear Form
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
