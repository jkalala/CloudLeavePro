-- Run this in your Supabase SQL editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create custom types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('EMPLOYEE', 'SUPERVISOR', 'HR', 'DIRECTOR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE leave_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE approval_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Drop existing tables if they exist (be careful in production!)
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.leave_approvals CASCADE;
DROP TABLE IF EXISTS public.leave_requests CASCADE;
DROP TABLE IF EXISTS public.leave_types CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.business_configs CASCADE;

-- Business configurations table
CREATE TABLE public.business_configs (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(500),
    primary_color VARCHAR(7) DEFAULT '#3B82F6',
    secondary_color VARCHAR(7) DEFAULT '#8B5CF6',
    departments JSONB DEFAULT '["IT", "HR", "Finance", "Operations"]',
    leave_types JSONB DEFAULT '[]',
    working_days INTEGER[] DEFAULT '{1,2,3,4,5}',
    time_zone VARCHAR(50) DEFAULT 'UTC',
    currency VARCHAR(3) DEFAULT 'USD',
    date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY',
    language VARCHAR(2) DEFAULT 'en',
    features JSONB DEFAULT '{"approvalWorkflow": true, "emailNotifications": true}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (extends auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'EMPLOYEE',
    department VARCHAR(100) NOT NULL,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    hire_date DATE NOT NULL,
    leave_balance INTEGER DEFAULT 21,
    sick_leave_balance INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    business_id VARCHAR(50) DEFAULT 'adpa' REFERENCES public.business_configs(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leave types table
CREATE TABLE public.leave_types (
    id SERIAL PRIMARY KEY,
    business_id VARCHAR(50) REFERENCES public.business_configs(id) DEFAULT 'adpa',
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    max_days_per_year INTEGER,
    requires_medical_certificate BOOLEAN DEFAULT FALSE,
    advance_notice_days INTEGER DEFAULT 7,
    color VARCHAR(50) DEFAULT 'bg-blue-100 text-blue-800',
    icon VARCHAR(10) DEFAULT '📋',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(business_id, code)
);

-- Leave requests table
CREATE TABLE public.leave_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    leave_type_id INTEGER REFERENCES public.leave_types(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    duration INTEGER NOT NULL,
    reason TEXT NOT NULL,
    emergency_contact VARCHAR(255),
    work_handover TEXT,
    status leave_status DEFAULT 'PENDING',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_by UUID REFERENCES public.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leave approvals workflow table
CREATE TABLE public.leave_approvals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    leave_request_id UUID REFERENCES public.leave_requests(id) ON DELETE CASCADE,
    approver_id UUID REFERENCES public.users(id),
    approval_level INTEGER NOT NULL,
    status approval_status DEFAULT 'PENDING',
    comments TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    related_leave_request_id UUID REFERENCES public.leave_requests(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default business config FIRST
INSERT INTO public.business_configs (id, name) VALUES ('adpa', 'ADPA');

-- Insert default leave types
INSERT INTO public.leave_types (business_id, name, code, max_days_per_year, requires_medical_certificate, advance_notice_days, color, icon) VALUES
('adpa', 'Annual Leave', 'ANNUAL', 21, FALSE, 7, 'bg-blue-100 text-blue-800', '🏖️'),
('adpa', 'Sick Leave', 'SICK', 10, TRUE, 0, 'bg-red-100 text-red-800', '🏥'),
('adpa', 'Emergency Leave', 'EMERGENCY', 5, FALSE, 0, 'bg-orange-100 text-orange-800', '🚨'),
('adpa', 'Maternity Leave', 'MATERNITY', 90, TRUE, 30, 'bg-pink-100 text-pink-800', '👶'),
('adpa', 'Paternity Leave', 'PATERNITY', 14, FALSE, 14, 'bg-purple-100 text-purple-800', '👨‍👶'),
('adpa', 'Unpaid Leave', 'UNPAID', NULL, FALSE, 14, 'bg-gray-100 text-gray-800', '💼');

-- Row Level Security Policies

-- Users can read their own data and managers can read their team's data
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Managers can view team profiles" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() 
            AND u.role IN ('SUPERVISOR', 'HR', 'DIRECTOR')
        )
    );

-- Leave requests policies
CREATE POLICY "Users can view own leave requests" ON public.leave_requests
    FOR SELECT USING (employee_id = auth.uid());

CREATE POLICY "Users can create own leave requests" ON public.leave_requests
    FOR INSERT WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Managers can view team leave requests" ON public.leave_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() 
            AND u.role IN ('SUPERVISOR', 'HR', 'DIRECTOR')
        )
    );

CREATE POLICY "Managers can update leave requests" ON public.leave_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() 
            AND u.role IN ('SUPERVISOR', 'HR', 'DIRECTOR')
        )
    );

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_users_business_id ON public.users(business_id);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_leave_requests_employee_id ON public.leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status ON public.leave_requests(status);
CREATE INDEX idx_leave_requests_dates ON public.leave_requests(start_date, end_date);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON public.leave_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_configs_updated_at BEFORE UPDATE ON public.business_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
