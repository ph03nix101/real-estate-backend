-- Fix for existing database - Update column lengths if needed
-- Run this if you get "value too long" errors

-- Make sure phone column is long enough
ALTER TABLE users ALTER COLUMN phone TYPE VARCHAR(50);

-- Ensure password_hash is long enough for bcrypt (60 characters)
ALTER TABLE users ALTER COLUMN password_hash TYPE VARCHAR(255);

-- Ensure email is long enough
ALTER TABLE users ALTER COLUMN email TYPE VARCHAR(255);

-- Ensure role is long enough
ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(50);
