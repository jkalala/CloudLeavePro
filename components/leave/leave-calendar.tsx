"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"

export function LeaveCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [leaveData, setLeaveData] = useState([])

  useEffect(() => {
    fetchLeaveData()
  }, [currentDate])

  const fetchLeaveData = async () => {
    try {
      // Get current user from localStorage
      const currentUser = localStorage.getItem("currentUser")
      if (!currentUser) {
        console.error("No user found")
        return
      }

      const response = await fetch(
        `/api/leave/calendar?month=${currentDate.getMonth()}&year=${currentDate.getFullYear()}`,
        {
          headers: {
            "x-user-info": currentUser,
          },
        },
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setLeaveData(data.leaves || [])
    } catch (error) {
      console.error("Error fetching calendar data:", error)
      setLeaveData([]) // Set empty array on error
    }
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-200"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      const dayLeaves = leaveData.filter((leave: any) => dateStr >= leave.startDate && dateStr <= leave.endDate)

      days.push(
        <div key={day} className="h-24 border border-gray-200 p-1 overflow-hidden">
          <div className="font-medium text-sm mb-1">{day}</div>
          <div className="space-y-1">
            {dayLeaves.slice(0, 2).map((leave: any, index) => (
              <Badge key={index} variant="secondary" className="text-xs truncate block">
                {leave.employeeName}
              </Badge>
            ))}
            {dayLeaves.length > 2 && <div className="text-xs text-gray-500">+{dayLeaves.length - 2} more</div>}
          </div>
        </div>,
      )
    }

    return days
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Leave Calendar</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium min-w-[120px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-0 border border-gray-200">
          {/* Day headers */}
          {dayNames.map((day) => (
            <div key={day} className="p-2 bg-gray-50 border-b border-gray-200 text-center font-medium text-sm">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {renderCalendarDays()}
        </div>

        <div className="mt-4 flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="w-4 h-4 p-0"></Badge>
            <span>Team Leave</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="default" className="w-4 h-4 p-0"></Badge>
            <span>Your Leave</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
