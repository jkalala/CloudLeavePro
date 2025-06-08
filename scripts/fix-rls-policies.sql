-- Fix RLS Policies for User Signup
-- Run this script to update your existing Supabase database

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Managers can view team profiles" ON public.users;
DROP POLICY IF EXISTS "Users can view own leave requests" ON public.leave_requests;
DROP POLICY IF EXISTS "Users can create own leave requests" ON public.leave_requests;
DROP POLICY IF EXISTS "Managers can view team leave requests" ON public.leave_requests;
DROP POLICY IF EXISTS "Managers can update leave requests" ON public.leave_requests;

-- Create updated policies for users table
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Managers can view team profiles" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() 
            AND u.role IN ('SUPERVISOR', 'HR', 'DIRECTOR')
        )
    );

-- Create updated policies for leave requests
CREATE POLICY "Users can view own leave requests" ON public.leave_requests
    FOR SELECT USING (employee_id = auth.uid());

CREATE POLICY "Users can create own leave requests" ON public.leave_requests
    FOR INSERT WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Users can update own leave requests" ON public.leave_requests
    FOR UPDATE USING (employee_id = auth.uid());

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

-- Create policies for leave approvals
CREATE POLICY "Users can view related approvals" ON public.leave_approvals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.leave_requests lr 
            WHERE lr.id = leave_request_id 
            AND lr.employee_id = auth.uid()
        )
        OR approver_id = auth.uid()
    );

CREATE POLICY "Managers can manage approvals" ON public.leave_approvals
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() 
            AND u.role IN ('SUPERVISOR', 'HR', 'DIRECTOR')
        )
    );

-- Create policies for notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

-- Create policies for business configs and leave types
CREATE POLICY "Authenticated users can view business configs" ON public.business_configs
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view leave types" ON public.leave_types
    FOR SELECT USING (auth.role() = 'authenticated');
