-- Seed data for development/testing

-- Insert a test agent user (password: 'password123')
INSERT INTO users (email, password_hash, first_name, last_name, phone, role) VALUES
('agent@test.com', '$2a$10$YourHashedPasswordHere', 'John', 'Doe', '+1-555-0100', 'agent'),
('admin@test.com', '$2a$10$YourHashedPasswordHere', 'Admin', 'User', '+1-555-0101', 'admin');

-- Note: You'll need to update the password_hash values after implementing authentication
-- For now, these are placeholders
