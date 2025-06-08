-- Run this script AFTER creating auth users to update with real UUIDs
-- Replace the UUIDs below with the actual ones from your Supabase Auth > Users

-- Example: Update user UUIDs with real ones from auth.users
-- UPDATE public.users SET id = 'real-uuid-from-auth-1' WHERE email = 'employee@adpa.com';
-- UPDATE public.users SET id = 'real-uuid-from-auth-2' WHERE email = 'supervisor@adpa.com';
-- UPDATE public.users SET id = 'real-uuid-from-auth-3' WHERE email = 'hr@adpa.com';
-- UPDATE public.users SET id = 'real-uuid-from-auth-4' WHERE email = 'director@adpa.com';

-- Also update related records
-- UPDATE public.leave_requests SET employee_id = 'real-uuid-from-auth-1' WHERE employee_id = '00000000-0000-0000-0000-000000000001';
-- UPDATE public.leave_requests SET approved_by = 'real-uuid-from-auth-2' WHERE approved_by = '00000000-0000-0000-0000-000000000002';
-- UPDATE public.leave_approvals SET approver_id = 'real-uuid-from-auth-2' WHERE approver_id = '00000000-0000-0000-0000-000000000002';
-- UPDATE public.notifications SET user_id = 'real-uuid-from-auth-1' WHERE user_id = '00000000-0000-0000-0000-000000000001';
-- UPDATE public.notifications SET user_id = 'real-uuid-from-auth-2' WHERE user_id = '00000000-0000-0000-0000-000000000002';
