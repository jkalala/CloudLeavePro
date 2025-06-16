-- Enhanced Notifications Schema for CloudLeave
-- Run this in your Supabase SQL editor to add comprehensive notification features

-- Update notifications table with enhanced fields
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

-- Insert comprehensive notification templates
INSERT INTO public.notification_templates (type, title_template, message_template, email_subject_template, email_body_template)
VALUES 
('leave_request_submitted', 
 'Leave Request Submitted', 
 'Your {{leave_type}} leave request for {{start_date}} to {{end_date}} ({{duration}} days) has been submitted for approval.',
 'Leave Request Submitted - {{leave_type}}',
 'Hi {{employee_name}},\n\nYour {{leave_type}} leave request has been submitted successfully.\n\nDetails:\n- Dates: {{start_date}} to {{end_date}}\n- Duration: {{duration}} days\n- Reason: {{reason}}\n\nYou will be notified once your request is reviewed.\n\nBest regards,\nCloudLeave Team'),

('leave_request_approved',
 'Leave Request Approved ✅',
 'Great news! Your {{leave_type}} leave request for {{start_date}} to {{end_date}} has been approved by {{approver_name}}.',
 'Leave Request Approved - {{leave_type}}',
 'Hi {{employee_name}},\n\nGreat news! Your {{leave_type}} leave request has been approved.\n\nDetails:\n- Dates: {{start_date}} to {{end_date}}\n- Duration: {{duration}} days\n- Approved by: {{approver_name}}\n\nEnjoy your time off!\n\nBest regards,\nCloudLeave Team'),

('leave_request_rejected',
 'Leave Request Rejected ❌',
 'Your {{leave_type}} leave request for {{start_date}} to {{end_date}} has been rejected. {{#rejection_reason}}Reason: {{rejection_reason}}{{/rejection_reason}}',
 'Leave Request Rejected - {{leave_type}}',
 'Hi {{employee_name}},\n\nUnfortunately, your {{leave_type}} leave request has been rejected.\n\nDetails:\n- Dates: {{start_date}} to {{end_date}}\n- Duration: {{duration}} days\n{{#rejection_reason}}- Reason for rejection: {{rejection_reason}}\n{{/rejection_reason}}\nPlease contact your manager for more information.\n\nBest regards,\nCloudLeave Team'),

('approval_required',
 'Leave Approval Required 📋',
 '{{employee_name}} has submitted a {{leave_type}} leave request ({{start_date}} to {{end_date}}, {{duration}} days) that requires your approval.',
 'Leave Approval Required - {{employee_name}}',
 'Hi {{approver_name}},\n\n{{employee_name}} has submitted a leave request that requires your approval.\n\nDetails:\n- Employee: {{employee_name}}\n- Leave Type: {{leave_type}}\n- Dates: {{start_date}} to {{end_date}}\n- Duration: {{duration}} days\n- Reason: {{reason}}\n\nPlease review and approve/reject this request in CloudLeave.\n\nBest regards,\nCloudLeave Team'),

('leave_reminder',
 'Upcoming Leave Reminder 📅',
 'Reminder: Your {{leave_type}} leave starts in {{days_until}} days ({{start_date}}).',
 'Upcoming Leave Reminder - {{leave_type}}',
 'Hi {{employee_name}},\n\nThis is a friendly reminder that your {{leave_type}} leave is coming up.\n\nDetails:\n- Start Date: {{start_date}}\n- End Date: {{end_date}}\n- Duration: {{duration}} days\n\nPlease ensure all necessary preparations are completed before your leave.\n\nBest regards,\nCloudLeave Team'),

('leave_balance_low',
 'Low Leave Balance Warning ⚠️',
 'Your {{leave_type}} balance is running low. You have {{remaining_days}} days remaining.',
 'Low Leave Balance Warning',
 'Hi {{employee_name}},\n\nThis is a notification that your {{leave_type}} balance is running low.\n\nCurrent Balance: {{remaining_days}} days\n\nPlease plan your leave requests accordingly.\n\nBest regards,\nCloudLeave Team'),

('system_maintenance',
 'System Maintenance Notice 🔧',
 'CloudLeave will undergo scheduled maintenance on {{maintenance_date}} from {{start_time}} to {{end_time}}.',
 'Scheduled Maintenance - CloudLeave',
 'Hi {{employee_name}},\n\nWe wanted to inform you about upcoming scheduled maintenance for CloudLeave.\n\nMaintenance Window:\n- Date: {{maintenance_date}}\n- Time: {{start_time}} to {{end_time}}\n\nDuring this time, the system may be temporarily unavailable. We apologize for any inconvenience.\n\nBest regards,\nCloudLeave Team'),

('welcome_new_user',
 'Welcome to CloudLeave! 🎉',
 'Welcome {{employee_name}}! Your CloudLeave account has been set up. You have {{leave_balance}} annual leave days available.',
 'Welcome to CloudLeave',
 'Hi {{employee_name}},\n\nWelcome to CloudLeave! Your account has been successfully set up.\n\nAccount Details:\n- Employee ID: {{employee_id}}\n- Department: {{department}}\n- Annual Leave Balance: {{leave_balance}} days\n\nYou can now submit leave requests and manage your time off through the CloudLeave platform.\n\nBest regards,\nCloudLeave Team')

ON CONFLICT (type) DO UPDATE SET
title_template = EXCLUDED.title_template,
message_template = EXCLUDED.message_template,
email_subject_template = EXCLUDED.email_subject_template,
email_body_template = EXCLUDED.email_body_template,
updated_at = NOW();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_priority ON public.notifications(user_id, priority);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON public.notifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

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
    
    -- Also clean up old read notifications (older than 30 days)
    DELETE FROM public.notifications 
    WHERE is_read = true 
    AND read_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Create function to update notification read timestamp
CREATE OR REPLACE FUNCTION update_notification_read_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_read = true AND OLD.is_read = false THEN
        NEW.read_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for notification read timestamp
DROP TRIGGER IF EXISTS update_notification_read_timestamp_trigger ON public.notifications;
CREATE TRIGGER update_notification_read_timestamp_trigger
BEFORE UPDATE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION update_notification_read_timestamp();

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

-- Create updated_at trigger for notification preferences
CREATE TRIGGER update_notification_preferences_updated_at 
BEFORE UPDATE ON public.notification_preferences
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Create updated_at trigger for notification templates
CREATE TRIGGER update_notification_templates_updated_at 
BEFORE UPDATE ON public.notification_templates
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Insert default notification preferences for existing users
INSERT INTO public.notification_preferences (user_id)
SELECT id FROM public.users
ON CONFLICT (user_id) DO NOTHING;