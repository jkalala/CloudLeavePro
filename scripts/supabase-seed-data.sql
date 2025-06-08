-- CloudLeave Supabase Seed Data
-- Run this after setting up the schema

-- Insert demo users (these will be created via Supabase Auth)
-- Note: In production, users would sign up through the application

-- You'll need to create these users in Supabase Auth first, then update with their UUIDs
-- For demo purposes, we'll use placeholder UUIDs

-- Insert demo user profiles (update UUIDs after creating auth users)
INSERT INTO public.users (id, email, name, role, department, employee_id, hire_date, leave_balance, sick_leave_balance, business_id) VALUES
('00000000-0000-0000-0000-000000000001', 'employee@adpa.com', 'John Employee', 'EMPLOYEE', 'IT', 'EMP001', '2023-01-15', 18, 8, 'adpa'),
('00000000-0000-0000-0000-000000000002', 'supervisor@adpa.com', 'Jane Supervisor', 'SUPERVISOR', 'IT', 'SUP001', '2022-03-10', 15, 10, 'adpa'),
('00000000-0000-0000-0000-000000000003', 'hr@adpa.com', 'HR Manager', 'HR', 'HR', 'HR001', '2021-06-01', 12, 7, 'adpa'),
('00000000-0000-0000-0000-000000000004', 'director@adpa.com', 'Executive Director', 'DIRECTOR', 'EXECUTIVE', 'DIR001', '2020-01-01', 21, 10, 'adpa');

-- Insert sample leave requests
INSERT INTO public.leave_requests (id, employee_id, leave_type_id, start_date, end_date, duration, reason, emergency_contact, work_handover, status, submitted_at, approved_by, approved_at) VALUES
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 1, '2024-01-15', '2024-01-19', 5, 'Family vacation', 'Jane Doe - 555-0123', 'Tasks delegated to team members', 'APPROVED', '2024-01-01 10:00:00+00', '00000000-0000-0000-0000-000000000002', '2024-01-02 14:30:00+00'),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 2, '2024-02-10', '2024-02-12', 3, 'Medical appointment and recovery', 'Jane Doe - 555-0123', 'Urgent tasks covered by supervisor', 'PENDING', '2024-02-08 09:15:00+00', NULL, NULL);

-- Insert approval workflow records
INSERT INTO public.leave_approvals (leave_request_id, approver_id, approval_level, status, approved_at) VALUES
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 1, 'APPROVED', '2024-01-02 14:30:00+00'),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 1, 'PENDING', NULL);

-- Insert sample notifications
INSERT INTO public.notifications (user_id, title, message, type, related_leave_request_id) VALUES
('00000000-0000-0000-0000-000000000001', 'Leave Request Approved', 'Your annual leave request for Jan 15-19 has been approved.', 'APPROVAL', '10000000-0000-0000-0000-000000000001'),
('00000000-0000-0000-0000-000000000002', 'New Leave Request', 'John Employee has submitted a sick leave request for your approval.', 'NEW_REQUEST', '10000000-0000-0000-0000-000000000002');
