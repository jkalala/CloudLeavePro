-- Enhanced Notifications Schema
-- Run this to update your existing database with notification features

-- Update notifications table with more fields
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
ADD COLUMN IF NOT EXISTS action_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS action_label VARCHAR(100),
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    email_enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE,
    leave_request_submitted BOOLEAN DEFAULT TRUE,
    leave_request_approved BOOLEAN DEFAULT TRUE,
    leave_request_rejected BOOLEAN DEFAULT TRUE,
    approval_required BOOLEAN DEFAULT TRUE,
    leave_reminder BOOLEAN DEFAULT TRUE,
    system_updates BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create notification templates table
CREATE TABLE IF NOT EXISTS public.notification_templates (
    id SERIAL PRIMARY KEY,
    type VARCHAR(100) NOT NULL UNIQUE,
    title_template VARCHAR(255) NOT NULL,
    message_template TEXT NOT NULL,
    email_subject_template VARCHAR(255),
    email_body_template TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default notification templates
INSERT INTO public.notification_templates (type, title_template, message_template, email_subject_template, email_body_template)
VALUES 
('leave_request_submitted', 
 'Leave Request Submitted', 
 'Your {{leave_type}} leave request for {{start_date}} to {{end_date}} has been submitted for approval.',
 'Leave Request Submitted - {{leave_type}}',
 'Hi {{employee_name}},\n\nYour {{leave_type}} leave request has been submitted successfully.\n\nDetails:\n- Dates: {{start_date}} to {{end_date}}\n- Duration: {{duration}} days\n- Reason: {{reason}}\n\nYou will be notified once your request is reviewed.\n\nBest regards,\nCloudLeave Team'),

('leave_request_approved',
 'Leave Request Approved',
 'Your {{leave_type}} leave request for {{start_date}} to {{end_date}} has been approved by {{approver_name}}.',
 'Leave Request Approved - {{leave_type}}',
 'Hi {{employee_name}},\n\nGreat news! Your {{leave_type}} leave request has been approved.\n\nDetails:\n- Dates: {{start_date}} to {{end_date}}\n- Duration: {{duration}} days\n- Approved by: {{approver_name}}\n\nEnjoy your time off!\n\nBest regards,\nCloudLeave Team'),

('leave_request_rejected',
 'Leave Request Rejected',
 'Your {{leave_type}} leave request for {{start_date}} to {{end_date}} has been rejected. Reason: {{rejection_reason}}',
 'Leave Request Rejected - {{leave_type}}',
 'Hi {{employee_name}},\n\nUnfortunately, your {{leave_type}} leave request has been rejected.\n\nDetails:\n- Dates: {{start_date}} to {{end_date}}\n- Duration: {{duration}} days\n- Reason for rejection: {{rejection_reason}}\n\nPlease contact your manager for more information.\n\nBest regards,\nCloudLeave Team'),

('approval_required',
 'Leave Approval Required',
 '{{employee_name}} has submitted a {{leave_type}} leave request that requires your approval.',
 'Leave Approval Required - {{employee_name}}',
 'Hi {{approver_name}},\n\n{{employee_name}} has submitted a leave request that requires your approval.\n\nDetails:\n- Employee: {{employee_name}}\n- Leave Type: {{leave_type}}\n- Dates: {{start_date}} to {{end_date}}\n- Duration: {{duration}} days\n- Reason: {{reason}}\n\nPlease review and approve/reject this request in CloudLeave.\n\nBest regards,\nCloudLeave Team'),

('leave_reminder',
 'Upcoming Leave Reminder',
 'Reminder: Your {{leave_type}} leave starts {{days_until}} days from now ({{start_date}}).',
 'Upcoming Leave Reminder - {{leave_type}}',
 'Hi {{employee_name}},\n\nThis is a friendly reminder that your {{leave_type}} leave is coming up.\n\nDetails:\n- Start Date: {{start_date}}\n- End Date: {{end_date}}\n- Duration: {{duration}} days\n\nPlease ensure all necessary preparations are completed before your leave.\n\nBest regards,\nCloudLeave Team')

ON CONFLICT (type) DO UPDATE SET
title_template = EXCLUDED.title_template,
message_template = EXCLUDED.message_template,
email_subject_template = EXCLUDED.email_subject_template,
email_body_template = EXCLUDED.email_body_template;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_priority ON public.notifications(user_id, priority);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON public.notifications(expires_at);

-- Create function to automatically create notification preferences for new users
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.notification_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new users
DROP TRIGGER IF EXISTS create_notification_preferences_trigger ON public.users;
CREATE TRIGGER create_notification_preferences_trigger
AFTER INSERT ON public.users
FOR EACH ROW
EXECUTE FUNCTION create_default_notification_preferences();

-- Create function to clean up expired notifications
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS void AS $$
BEGIN
    DELETE FROM public.notifications 
    WHERE expires_at IS NOT NULL 
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Update RLS policies for new tables
CREATE POLICY "Users can view own notification preferences" ON public.notification_preferences
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notification preferences" ON public.notification_preferences
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert own notification preferences" ON public.notification_preferences
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "All users can view notification templates" ON public.notification_templates
    FOR SELECT USING (auth.role() = 'authenticated');

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
