export interface BusinessConfig {
  id: string
  name: string
  logo?: string
  primaryColor: string
  secondaryColor: string
  departments: string[]
  leaveTypes: LeaveTypeConfig[]
  workingDays: number[]
  timeZone: string
  currency: string
  dateFormat: string
  language: "en" | "pt" | "fr"
  features: {
    approvalWorkflow: boolean
    emailNotifications: boolean
    calendarIntegration: boolean
    reportGeneration: boolean
    mobileApp: boolean
  }
}

export interface LeaveTypeConfig {
  id: string
  name: string
  code: string
  maxDaysPerYear?: number
  requiresMedicalCertificate: boolean
  advanceNoticeDays: number
  color: string
  icon: string
  isActive: boolean
}

// Default business configurations
export const defaultBusinessConfig: BusinessConfig = {
  id: "default",
  name: "ADPA",
  primaryColor: "#3B82F6",
  secondaryColor: "#8B5CF6",
  departments: ["IT", "HR", "Finance", "Operations", "Marketing", "Sales"],
  leaveTypes: [
    {
      id: "annual",
      name: "Annual Leave",
      code: "ANNUAL",
      maxDaysPerYear: 21,
      requiresMedicalCertificate: false,
      advanceNoticeDays: 7,
      color: "bg-blue-100 text-blue-800",
      icon: "🏖️",
      isActive: true,
    },
    {
      id: "sick",
      name: "Sick Leave",
      code: "SICK",
      maxDaysPerYear: 10,
      requiresMedicalCertificate: true,
      advanceNoticeDays: 0,
      color: "bg-red-100 text-red-800",
      icon: "🏥",
      isActive: true,
    },
    {
      id: "emergency",
      name: "Emergency Leave",
      code: "EMERGENCY",
      maxDaysPerYear: 5,
      requiresMedicalCertificate: false,
      advanceNoticeDays: 0,
      color: "bg-orange-100 text-orange-800",
      icon: "🚨",
      isActive: true,
    },
    {
      id: "maternity",
      name: "Maternity Leave",
      code: "MATERNITY",
      maxDaysPerYear: 90,
      requiresMedicalCertificate: true,
      advanceNoticeDays: 30,
      color: "bg-pink-100 text-pink-800",
      icon: "👶",
      isActive: true,
    },
    {
      id: "paternity",
      name: "Paternity Leave",
      code: "PATERNITY",
      maxDaysPerYear: 14,
      requiresMedicalCertificate: false,
      advanceNoticeDays: 14,
      color: "bg-purple-100 text-purple-800",
      icon: "👨‍👶",
      isActive: true,
    },
    {
      id: "unpaid",
      name: "Unpaid Leave",
      code: "UNPAID",
      requiresMedicalCertificate: false,
      advanceNoticeDays: 14,
      color: "bg-gray-100 text-gray-800",
      icon: "💼",
      isActive: true,
    },
  ],
  workingDays: [1, 2, 3, 4, 5], // Monday to Friday
  timeZone: "UTC",
  currency: "USD",
  dateFormat: "MM/DD/YYYY",
  language: "en",
  features: {
    approvalWorkflow: true,
    emailNotifications: true,
    calendarIntegration: true,
    reportGeneration: true,
    mobileApp: false,
  },
}

// Sample business configurations for different organizations
export const businessConfigs: Record<string, BusinessConfig> = {
  adpa: {
    ...defaultBusinessConfig,
    id: "adpa",
    name: "ADPA",
    language: "en",
  },
  "empresa-brasil": {
    ...defaultBusinessConfig,
    id: "empresa-brasil",
    name: "Empresa Brasil",
    language: "pt",
    currency: "BRL",
    dateFormat: "DD/MM/YYYY",
    departments: ["TI", "RH", "Financeiro", "Operações", "Marketing", "Vendas"],
    leaveTypes: [
      {
        id: "ferias",
        name: "Férias Anuais",
        code: "ANNUAL",
        maxDaysPerYear: 30,
        requiresMedicalCertificate: false,
        advanceNoticeDays: 15,
        color: "bg-blue-100 text-blue-800",
        icon: "🏖️",
        isActive: true,
      },
      {
        id: "medica",
        name: "Licença Médica",
        code: "SICK",
        maxDaysPerYear: 15,
        requiresMedicalCertificate: true,
        advanceNoticeDays: 0,
        color: "bg-red-100 text-red-800",
        icon: "🏥",
        isActive: true,
      },
    ],
  },
  "entreprise-france": {
    ...defaultBusinessConfig,
    id: "entreprise-france",
    name: "Entreprise France",
    language: "fr",
    currency: "EUR",
    dateFormat: "DD/MM/YYYY",
    departments: ["IT", "RH", "Finance", "Opérations", "Marketing", "Ventes"],
    leaveTypes: [
      {
        id: "conges",
        name: "Congés annuels",
        code: "ANNUAL",
        maxDaysPerYear: 25,
        requiresMedicalCertificate: false,
        advanceNoticeDays: 10,
        color: "bg-blue-100 text-blue-800",
        icon: "🏖️",
        isActive: true,
      },
      {
        id: "maladie",
        name: "Congé maladie",
        code: "SICK",
        requiresMedicalCertificate: true,
        advanceNoticeDays: 0,
        color: "bg-red-100 text-red-800",
        icon: "🏥",
        isActive: true,
      },
    ],
  },
}

export function getBusinessConfig(businessId = "adpa"): BusinessConfig {
  return businessConfigs[businessId] || defaultBusinessConfig
}

export function updateBusinessConfig(businessId: string, updates: Partial<BusinessConfig>): BusinessConfig {
  const currentConfig = getBusinessConfig(businessId)
  const updatedConfig = { ...currentConfig, ...updates }
  businessConfigs[businessId] = updatedConfig

  // In a real app, this would save to database
  if (typeof window !== "undefined") {
    localStorage.setItem(`business-config-${businessId}`, JSON.stringify(updatedConfig))
  }

  return updatedConfig
}
