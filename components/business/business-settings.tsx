"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, X, Settings, Building, Users, Calendar } from "lucide-react"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import type { BusinessConfig, LeaveTypeConfig } from "@/lib/business-config"
import { getBusinessConfig, updateBusinessConfig } from "@/lib/business-config"
import type { Language } from "@/lib/i18n"

export function BusinessSettings() {
  const [config, setConfig] = useState<BusinessConfig>(getBusinessConfig())
  const [newDepartment, setNewDepartment] = useState("")
  const [newLeaveType, setNewLeaveType] = useState<Partial<LeaveTypeConfig>>({
    name: "",
    code: "",
    color: "bg-blue-100 text-blue-800",
    icon: "📋",
    isActive: true,
    requiresMedicalCertificate: false,
    advanceNoticeDays: 7,
  })
  const [message, setMessage] = useState("")

  const handleSave = () => {
    try {
      updateBusinessConfig(config.id, config)
      setMessage("Settings saved successfully!")
      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      setMessage("Error saving settings")
    }
  }

  const addDepartment = () => {
    if (newDepartment.trim() && !config.departments.includes(newDepartment.trim())) {
      setConfig({
        ...config,
        departments: [...config.departments, newDepartment.trim()],
      })
      setNewDepartment("")
    }
  }

  const removeDepartment = (dept: string) => {
    setConfig({
      ...config,
      departments: config.departments.filter((d) => d !== dept),
    })
  }

  const addLeaveType = () => {
    if (newLeaveType.name && newLeaveType.code) {
      const leaveType: LeaveTypeConfig = {
        id: newLeaveType.code?.toLowerCase() || "",
        name: newLeaveType.name,
        code: newLeaveType.code,
        color: newLeaveType.color || "bg-blue-100 text-blue-800",
        icon: newLeaveType.icon || "📋",
        isActive: true,
        requiresMedicalCertificate: newLeaveType.requiresMedicalCertificate || false,
        advanceNoticeDays: newLeaveType.advanceNoticeDays || 7,
        maxDaysPerYear: newLeaveType.maxDaysPerYear,
      }

      setConfig({
        ...config,
        leaveTypes: [...config.leaveTypes, leaveType],
      })

      setNewLeaveType({
        name: "",
        code: "",
        color: "bg-blue-100 text-blue-800",
        icon: "📋",
        isActive: true,
        requiresMedicalCertificate: false,
        advanceNoticeDays: 7,
      })
    }
  }

  const removeLeaveType = (id: string) => {
    setConfig({
      ...config,
      leaveTypes: config.leaveTypes.filter((lt) => lt.id !== id),
    })
  }

  const updateLeaveType = (id: string, updates: Partial<LeaveTypeConfig>) => {
    setConfig({
      ...config,
      leaveTypes: config.leaveTypes.map((lt) => (lt.id === id ? { ...lt, ...updates } : lt)),
    })
  }

  const colorOptions = [
    "bg-blue-100 text-blue-800",
    "bg-green-100 text-green-800",
    "bg-red-100 text-red-800",
    "bg-orange-100 text-orange-800",
    "bg-purple-100 text-purple-800",
    "bg-pink-100 text-pink-800",
    "bg-gray-100 text-gray-800",
  ]

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {message && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{message}</AlertDescription>
        </Alert>
      )}

      {/* Company Information */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5" />
            <span>Company Information</span>
          </CardTitle>
          <CardDescription>Configure your organization's basic details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                placeholder="Enter company name"
              />
            </div>

            <div className="space-y-2">
              <Label>Language</Label>
              <LanguageSwitcher
                currentLanguage={config.language}
                onLanguageChange={(lang: Language) => setConfig({ ...config, language: lang })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                value={config.currency}
                onChange={(e) => setConfig({ ...config, currency: e.target.value })}
                placeholder="USD, EUR, BRL..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Time Zone</Label>
              <Input
                id="timezone"
                value={config.timeZone}
                onChange={(e) => setConfig({ ...config, timeZone: e.target.value })}
                placeholder="UTC, America/New_York..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Departments */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Departments</span>
          </CardTitle>
          <CardDescription>Manage your organization's departments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              value={newDepartment}
              onChange={(e) => setNewDepartment(e.target.value)}
              placeholder="Add new department"
              onKeyPress={(e) => e.key === "Enter" && addDepartment()}
            />
            <Button onClick={addDepartment}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {config.departments.map((dept) => (
              <Badge key={dept} variant="secondary" className="px-3 py-1">
                {dept}
                <button onClick={() => removeDepartment(dept)} className="ml-2 hover:text-red-600">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Leave Types */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Leave Types</span>
          </CardTitle>
          <CardDescription>Configure available leave types for your organization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add New Leave Type */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-medium mb-4">Add New Leave Type</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={newLeaveType.name || ""}
                  onChange={(e) => setNewLeaveType({ ...newLeaveType, name: e.target.value })}
                  placeholder="Leave type name"
                />
              </div>

              <div className="space-y-2">
                <Label>Code</Label>
                <Input
                  value={newLeaveType.code || ""}
                  onChange={(e) => setNewLeaveType({ ...newLeaveType, code: e.target.value.toUpperCase() })}
                  placeholder="LEAVE_CODE"
                />
              </div>

              <div className="space-y-2">
                <Label>Icon</Label>
                <Input
                  value={newLeaveType.icon || ""}
                  onChange={(e) => setNewLeaveType({ ...newLeaveType, icon: e.target.value })}
                  placeholder="📋"
                />
              </div>

              <div className="space-y-2">
                <Label>Max Days/Year</Label>
                <Input
                  type="number"
                  value={newLeaveType.maxDaysPerYear || ""}
                  onChange={(e) =>
                    setNewLeaveType({ ...newLeaveType, maxDaysPerYear: Number.parseInt(e.target.value) || undefined })
                  }
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4 mt-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newLeaveType.requiresMedicalCertificate || false}
                  onCheckedChange={(checked) =>
                    setNewLeaveType({ ...newLeaveType, requiresMedicalCertificate: checked })
                  }
                />
                <Label>Requires Medical Certificate</Label>
              </div>
            </div>

            <Button onClick={addLeaveType} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Add Leave Type
            </Button>
          </div>

          {/* Existing Leave Types */}
          <div className="space-y-4">
            {config.leaveTypes.map((leaveType) => (
              <div key={leaveType.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{leaveType.icon}</span>
                    <div>
                      <h4 className="font-medium">{leaveType.name}</h4>
                      <p className="text-sm text-gray-600">{leaveType.code}</p>
                    </div>
                    <Badge className={leaveType.color}>{leaveType.code}</Badge>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={leaveType.isActive}
                      onCheckedChange={(checked) => updateLeaveType(leaveType.id, { isActive: checked })}
                    />
                    <Button variant="outline" size="sm" onClick={() => removeLeaveType(leaveType.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <Label className="text-xs">Max Days/Year</Label>
                    <p>{leaveType.maxDaysPerYear || "Unlimited"}</p>
                  </div>
                  <div>
                    <Label className="text-xs">Advance Notice</Label>
                    <p>{leaveType.advanceNoticeDays} days</p>
                  </div>
                  <div>
                    <Label className="text-xs">Medical Certificate</Label>
                    <p>{leaveType.requiresMedicalCertificate ? "Required" : "Not required"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Features</span>
          </CardTitle>
          <CardDescription>Enable or disable features for your organization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(config.features).map(([feature, enabled]) => (
            <div key={feature} className="flex items-center justify-between">
              <div>
                <Label className="capitalize">{feature.replace(/([A-Z])/g, " $1").trim()}</Label>
                <p className="text-sm text-gray-600">
                  {feature === "approvalWorkflow" && "Require manager approval for leave requests"}
                  {feature === "emailNotifications" && "Send email notifications for status changes"}
                  {feature === "calendarIntegration" && "Integrate with external calendar systems"}
                  {feature === "reportGeneration" && "Generate detailed leave reports"}
                  {feature === "mobileApp" && "Enable mobile application access"}
                </p>
              </div>
              <Switch
                checked={enabled}
                onCheckedChange={(checked) =>
                  setConfig({
                    ...config,
                    features: { ...config.features, [feature]: checked },
                  })
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          Save Settings
        </Button>
      </div>
    </div>
  )
}
