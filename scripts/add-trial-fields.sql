-- Add trial-related fields to the business_configs table
ALTER TABLE public.business_configs 
ADD COLUMN IF NOT EXISTS trial_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS trial_days INTEGER DEFAULT 14,
ADD COLUMN IF NOT EXISTS trial_features JSONB DEFAULT '["all"]';

-- Add trial-related fields to the users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'trial',
ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'free';

-- Create a new table for subscription plans
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    price_monthly DECIMAL(10, 2) NOT NULL,
    price_yearly DECIMAL(10, 2) NOT NULL,
    features JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, code, price_monthly, price_yearly, features)
VALUES 
('Free', 'free', 0, 0, '["basic_leave_management", "5_users"]'),
('Starter', 'starter', 9.99, 99.99, '["basic_leave_management", "advanced_reporting", "email_notifications", "25_users"]'),
('Professional', 'professional', 19.99, 199.99, '["basic_leave_management", "advanced_reporting", "email_notifications", "calendar_integration", "unlimited_users"]'),
('Enterprise', 'enterprise', 49.99, 499.99, '["all"]')
ON CONFLICT (code) DO NOTHING;

-- Create a function to set trial dates when a user signs up
CREATE OR REPLACE FUNCTION set_trial_dates()
RETURNS TRIGGER AS $$
DECLARE
    trial_days INTEGER;
BEGIN
    -- Get trial days from business config
    SELECT bc.trial_days INTO trial_days
    FROM public.business_configs bc
    WHERE bc.id = NEW.business_id;
    
    -- Set trial dates
    NEW.trial_start_date = NOW();
    NEW.trial_end_date = NOW() + (trial_days || ' days')::INTERVAL;
    NEW.subscription_status = 'trial';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to set trial dates on user insert
DROP TRIGGER IF EXISTS set_user_trial_dates ON public.users;
CREATE TRIGGER set_user_trial_dates
BEFORE INSERT ON public.users
FOR EACH ROW
EXECUTE FUNCTION set_trial_dates();
