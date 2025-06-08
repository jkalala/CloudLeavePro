-- ADPA Leave Management System - Seed Data
-- Insert initial data for testing

-- Insert leave types
INSERT INTO leave_types (name, code, max_days_per_year, requires_medical_certificate, advance_notice_days) VALUES
('Annual Leave', 'ANNUAL', 21, FALSE, 7),
('Sick Leave', 'SICK', 10, TRUE, 0),
('Emergency Leave', 'EMERGENCY', 5, FALSE, 0),
('Maternity Leave', 'MATERNITY', 90, TRUE, 30),
('Paternity Leave', 'PATERNITY', 14, FALSE, 14),
('Unpaid Leave', 'UNPAID', NULL, FALSE, 14);

-- Insert demo users
INSERT INTO users (email, password_hash, name, role, department, employee_id, hire_date, leave_balance, sick_leave_balance) VALUES
('employee@adpa.com', '$2b$10$hash1', 'John Employee', 'EMPLOYEE', 'IT', 'EMP001', '2023-01-15', 18, 8),
('supervisor@adpa.com', '$2b$10$hash2', 'Jane Supervisor', 'SUPERVISOR', 'IT', 'SUP001', '2022-03-10', 15, 10),
('hr@adpa.com', '$2b$10$hash3', 'HR Manager', 'HR', 'HR', 'HR001', '2021-06-01', 12, 7),
('director@adpa.com', '$2b$10$hash4', 'Executive Director', 'DIRECTOR', 'EXECUTIVE', 'DIR001', '2020-01-01', 21, 10),
('alice@adpa.com', '$2b$10$hash5', 'Alice Johnson', 'EMPLOYEE', 'Finance', 'EMP002', '2023-05-20', 19, 9),
('mike@adpa.com', '$2b$10$hash6', 'Mike Wilson', 'EMPLOYEE', 'Operations', 'EMP003', '2022-11-12', 16, 6);

-- Insert company holidays
INSERT INTO company_holidays (name, date, is_recurring) VALUES
('New Year''s Day', '2024-01-01', TRUE),
('Independence Day', '2024-07-04', TRUE),
('Christmas Day', '2024-12-25', TRUE),
('Thanksgiving', '2024-11-28', FALSE),
('Labor Day', '2024-09-02', FALSE);

-- Insert sample leave requests
INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, duration, reason, emergency_contact, work_handover, status, submitted_at, approved_by, approved_at) VALUES
(1, 1, '2024-01-15', '2024-01-19', 5, 'Family vacation', 'Jane Doe - 555-0123', 'Tasks delegated to team members', 'APPROVED', '2024-01-01 10:00:00', 2, '2024-01-02 14:30:00'),
(5, 2, '2024-02-10', '2024-02-12', 3, 'Medical appointment and recovery', 'Bob Johnson - 555-0456', 'Urgent tasks covered by supervisor', 'PENDING', '2024-02-08 09:15:00', NULL, NULL),
(6, 3, '2024-02-15', '2024-02-16', 2, 'Family emergency', 'Sarah Wilson - 555-0789', 'Critical meetings rescheduled', 'PENDING', '2024-02-14 16:45:00', NULL, NULL);

-- Insert approval workflow records
INSERT INTO leave_approvals (leave_request_id, approver_id, approval_level, status, approved_at) VALUES
(1, 2, 1, 'APPROVED', '2024-01-02 14:30:00'),
(2, 2, 1, 'PENDING', NULL),
(3, 2, 1, 'PENDING', NULL);

-- Insert sample notifications
INSERT INTO notifications (user_id, title, message, type, related_leave_request_id) VALUES
(1, 'Leave Request Approved', 'Your annual leave request for Jan 15-19 has been approved.', 'APPROVAL', 1),
(2, 'New Leave Request', 'Alice Johnson has submitted a sick leave request for your approval.', 'NEW_REQUEST', 2),
(2, 'New Leave Request', 'Mike Wilson has submitted an emergency leave request for your approval.', 'NEW_REQUEST', 3);

-- Insert leave balance history
INSERT INTO leave_balance_history (employee_id, leave_type, balance_before, balance_after, change_amount, change_reason, leave_request_id) VALUES
(1, 'ANNUAL', 21, 16, -5, 'Leave taken', 1);
