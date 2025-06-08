"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Download, Filter, TrendingUp, Users, Calendar } from "lucide-react"

export function ReportsView() {
  const [reportData, setReportData] = useState({
    summary: {
      totalRequests: 0,
      approvedRequests: 0,
      pendingRequests: 0,
      rejectedRequests: 0,
      averageProcessingTime: 0,
    },
    leaveTypes: [],
    monthlyTrends: [],
    departmentStats: [],
  })
  const [selectedPeriod, setSelectedPeriod] = useState("current-month")
  const [selectedDepartment, setSelectedDepartment] = useState("all")

  useEffect(() => {
    fetchReportData()
  }, [selectedPeriod, selectedDepartment])

  const fetchReportData = async () => {
    try {
      // Get current user from localStorage
      const currentUser = localStorage.getItem("currentUser")
      if (!currentUser) {
        console.error("No user found")
        return
      }

      const response = await fetch(`/api/leave/reports?period=${selectedPeriod}&department=${selectedDepartment}`, {
        headers: {
          "x-user-info": currentUser,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setReportData(data)
    } catch (error) {
      console.error("Error fetching report data:", error)
      // Set default empty data on error
      setReportData({
        summary: {
          totalRequests: 0,
          approvedRequests: 0,
          pendingRequests: 0,
          rejectedRequests: 0,
          averageProcessingTime: 0,
        },
        leaveTypes: [],
        monthlyTrends: [],
        departmentStats: [],
      })
    }
  }

  const exportReport = async (format: "pdf" | "excel") => {
    try {
      const response = await fetch(
        `/api/leave/reports/export?format=${format}&period=${selectedPeriod}&department=${selectedDepartment}`,
      )
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `leave-report-${selectedPeriod}.${format === "pdf" ? "pdf" : "xlsx"}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error exporting report:", error)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      APPROVED: "text-green-600 bg-green-100",
      PENDING: "text-orange-600 bg-orange-100",
      REJECTED: "text-red-600 bg-red-100",
    }
    return colors[status] || "text-gray-600 bg-gray-100"
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Report Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Period</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current-month">Current Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="current-quarter">Current Quarter</SelectItem>
                  <SelectItem value="current-year">Current Year</SelectItem>
                  <SelectItem value="last-year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="hr">Human Resources</SelectItem>
                  <SelectItem value="it">Information Technology</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end space-x-2">
              <Button onClick={() => exportReport("pdf")} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button onClick={() => exportReport("excel")} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.summary.totalRequests}</div>
            <p className="text-xs text-muted-foreground">All leave requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{reportData.summary.approvedRequests}</div>
            <p className="text-xs text-muted-foreground">
              {reportData.summary.totalRequests > 0
                ? Math.round((reportData.summary.approvedRequests / reportData.summary.totalRequests) * 100)
                : 0}
              % approval rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{reportData.summary.pendingRequests}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Processing</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.summary.averageProcessingTime}d</div>
            <p className="text-xs text-muted-foreground">Average processing time</p>
          </CardContent>
        </Card>
      </div>

      {/* Leave Types Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Types Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData.leaveTypes.map((type: any, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Badge variant="outline">{type.type}</Badge>
                  <span className="font-medium">{type.count} requests</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(type.count / reportData.summary.totalRequests) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">
                    {Math.round((type.count / reportData.summary.totalRequests) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Department Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Department Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Department</th>
                  <th className="text-left p-2">Total Requests</th>
                  <th className="text-left p-2">Approved</th>
                  <th className="text-left p-2">Pending</th>
                  <th className="text-left p-2">Rejected</th>
                  <th className="text-left p-2">Avg. Days</th>
                </tr>
              </thead>
              <tbody>
                {reportData.departmentStats.map((dept: any, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 font-medium">{dept.department}</td>
                    <td className="p-2">{dept.totalRequests}</td>
                    <td className="p-2">
                      <Badge className={getStatusColor("APPROVED")}>{dept.approved}</Badge>
                    </td>
                    <td className="p-2">
                      <Badge className={getStatusColor("PENDING")}>{dept.pending}</Badge>
                    </td>
                    <td className="p-2">
                      <Badge className={getStatusColor("REJECTED")}>{dept.rejected}</Badge>
                    </td>
                    <td className="p-2">{dept.averageDays}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
