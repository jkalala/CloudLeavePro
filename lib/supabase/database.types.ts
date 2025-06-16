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
          stripe_price_id_monthly: string | null
          stripe_price_id_yearly: string | null
          stripe_product_id: string | null
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
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          stripe_product_id?: string | null
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
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          stripe_product_id?: string | null
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
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          priority: "low" | "normal" | "high" | "urgent"
          is_read: boolean
          action_url: string | null
          action_label: string | null
          expires_at: string | null
          read_at: string | null
          metadata: Json
          related_leave_request_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: string
          priority?: "low" | "normal" | "high" | "urgent"
          is_read?: boolean
          action_url?: string | null
          action_label?: string | null
          expires_at?: string | null
          read_at?: string | null
          metadata?: Json
          related_leave_request_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          priority?: "low" | "normal" | "high" | "urgent"
          is_read?: boolean
          action_url?: string | null
          action_label?: string | null
          expires_at?: string | null
          read_at?: string | null
          metadata?: Json
          related_leave_request_id?: string | null
          created_at?: string
        }
      }
      notification_preferences: {
        Row: {
          id: string
          user_id: string
          email_enabled: boolean
          push_enabled: boolean
          leave_request_submitted: boolean
          leave_request_approved: boolean
          leave_request_rejected: boolean
          approval_required: boolean
          leave_reminder: boolean
          system_updates: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email_enabled?: boolean
          push_enabled?: boolean
          leave_request_submitted?: boolean
          leave_request_approved?: boolean
          leave_request_rejected?: boolean
          approval_required?: boolean
          leave_reminder?: boolean
          system_updates?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email_enabled?: boolean
          push_enabled?: boolean
          leave_request_submitted?: boolean
          leave_request_approved?: boolean
          leave_request_rejected?: boolean
          approval_required?: boolean
          leave_reminder?: boolean
          system_updates?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      notification_templates: {
        Row: {
          id: number
          type: string
          title_template: string
          message_template: string
          email_subject_template: string | null
          email_body_template: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          type: string
          title_template: string
          message_template: string
          email_subject_template?: string | null
          email_body_template?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          type?: string
          title_template?: string
          message_template?: string
          email_subject_template?: string | null
          email_body_template?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      payment_methods: {
        Row: {
          id: string
          user_id: string
          stripe_payment_method_id: string
          type: string
          brand: string | null
          last4: string | null
          exp_month: number | null
          exp_year: number | null
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_payment_method_id: string
          type: string
          brand?: string | null
          last4?: string | null
          exp_month?: number | null
          exp_year?: number | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_payment_method_id?: string
          type?: string
          brand?: string | null
          last4?: string | null
          exp_month?: number | null
          exp_year?: number | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_subscription_id: string
          stripe_customer_id: string
          plan_code: string
          status: string
          current_period_start: string
          current_period_end: string
          cancel_at_period_end: boolean
          canceled_at: string | null
          trial_start: string | null
          trial_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_subscription_id: string
          stripe_customer_id: string
          plan_code: string
          status: string
          current_period_start: string
          current_period_end: string
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          trial_start?: string | null
          trial_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_subscription_id?: string
          stripe_customer_id?: string
          plan_code?: string
          status?: string
          current_period_start?: string
          current_period_end?: string
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          trial_start?: string | null
          trial_end?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          user_id: string
          subscription_id: string
          stripe_invoice_id: string
          amount_paid: number
          amount_due: number
          currency: string
          status: string
          invoice_pdf: string | null
          hosted_invoice_url: string | null
          invoice_number: string | null
          period_start: string | null
          period_end: string | null
          due_date: string | null
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subscription_id: string
          stripe_invoice_id: string
          amount_paid: number
          amount_due: number
          currency?: string
          status: string
          invoice_pdf?: string | null
          hosted_invoice_url?: string | null
          invoice_number?: string | null
          period_start?: string | null
          period_end?: string | null
          due_date?: string | null
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subscription_id?: string
          stripe_invoice_id?: string
          amount_paid?: number
          amount_due?: number
          currency?: string
          status?: string
          invoice_pdf?: string | null
          hosted_invoice_url?: string | null
          invoice_number?: string | null
          period_start?: string | null
          period_end?: string | null
          due_date?: string | null
          paid_at?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_notifications: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
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