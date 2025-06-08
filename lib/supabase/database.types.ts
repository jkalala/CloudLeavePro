export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: "EMPLOYEE" | "SUPERVISOR" | "HR" | "DIRECTOR"
          department: string
          employee_id: string
          hire_date: string
          leave_balance: number
          sick_leave_balance: number
          is_active: boolean
          business_id: string
          created_at: string
          updated_at: string
          trial_start_date: string | null
          trial_end_date: string | null
          subscription_status: string
          subscription_plan: string
        }
        Insert: {
          id: string
          email: string
          name: string
          role?: "EMPLOYEE" | "SUPERVISOR" | "HR" | "DIRECTOR"
          department: string
          employee_id: string
          hire_date: string
          leave_balance?: number
          sick_leave_balance?: number
          is_active?: boolean
          business_id?: string
          created_at?: string
          updated_at?: string
          trial_start_date?: string | null
          trial_end_date?: string | null
          subscription_status?: string
          subscription_plan?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: "EMPLOYEE" | "SUPERVISOR" | "HR" | "DIRECTOR"
          department?: string
          employee_id?: string
          hire_date?: string
          leave_balance?: number
          sick_leave_balance?: number
          is_active?: boolean
          business_id?: string
          created_at?: string
          updated_at?: string
          trial_start_date?: string | null
          trial_end_date?: string | null
          subscription_status?: string
          subscription_plan?: string
        }
      }
      business_configs: {
        Row: {
          id: string
          name: string
          logo_url: string | null
          primary_color: string
          secondary_color: string
          departments: Json
          leave_types: Json
          working_days: number[]
          time_zone: string
          currency: string
          date_format: string
          language: string
          features: Json
          created_at: string
          updated_at: string
          trial_enabled: boolean
          trial_days: number
          trial_features: Json
        }
        Insert: {
          id: string
          name: string
          logo_url?: string | null
          primary_color?: string
          secondary_color?: string
          departments?: Json
          leave_types?: Json
          working_days?: number[]
          time_zone?: string
          currency?: string
          date_format?: string
          language?: string
          features?: Json
          created_at?: string
          updated_at?: string
          trial_enabled?: boolean
          trial_days?: number
          trial_features?: Json
        }
        Update: {
          id?: string
          name?: string
          logo_url?: string | null
          primary_color?: string
          secondary_color?: string
          departments?: Json
          leave_types?: Json
          working_days?: number[]
          time_zone?: string
          currency?: string
          date_format?: string
          language?: string
          features?: Json
          created_at?: string
          updated_at?: string
          trial_enabled?: boolean
          trial_days?: number
          trial_features?: Json
        }
      }
      subscription_plans: {
        Row: {
          id: number
          name: string
          code: string
          price_monthly: number
          price_yearly: number
          features: Json
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          code: string
          price_monthly: number
          price_yearly: number
          features: Json
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          code?: string
          price_monthly?: number
          price_yearly?: number
          features?: Json
          is_active?: boolean
          created_at?: string
        }
      }
      leave_requests: {
        Row: {
          id: string
          employee_id: string
          leave_type_id: number
          start_date: string
          end_date: string
          duration: number
          reason: string
          emergency_contact: string | null
          work_handover: string | null
          status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED"
          submitted_at: string
          approved_by: string | null
          approved_at: string | null
          rejection_reason: string | null
          comments: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          leave_type_id: number
          start_date: string
          end_date: string
          duration: number
          reason: string
          emergency_contact?: string | null
          work_handover?: string | null
          status?: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED"
          submitted_at?: string
          approved_by?: string | null
          approved_at?: string | null
          rejection_reason?: string | null
          comments?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          leave_type_id?: number
          start_date?: string
          end_date?: string
          duration?: number
          reason?: string
          emergency_contact?: string | null
          work_handover?: string | null
          status?: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED"
          submitted_at?: string
          approved_by?: string | null
          approved_at?: string | null
          rejection_reason?: string | null
          comments?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      // Other tables remain the same...
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: "EMPLOYEE" | "SUPERVISOR" | "HR" | "DIRECTOR"
      leave_status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED"
      approval_status: "PENDING" | "APPROVED" | "REJECTED"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
