-- Add geocoding and address fields to properties table
-- Run this migration after the initial schema

\\c real_estate_db;

-- Add new columns for geocoding
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS address VARCHAR(500),
ADD COLUMN IF NOT EXISTS zip_code VARCHAR(20);

-- Create index for coordinate-based queries
CREATE INDEX IF NOT EXISTS idx_properties_coordinates ON properties(latitude, longitude);

-- Update existing properties with full address (optional)
-- This combines location, city, and state into a full address field
UPDATE properties 
SET address = CONCAT_WS(', ', location, city, state)
WHERE address IS NULL AND location IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN properties.latitude IS 'Geographic latitude coordinate';
COMMENT ON COLUMN properties.longitude IS 'Geographic longitude coordinate';
COMMENT ON COLUMN properties.address IS 'Full street address';
COMMENT ON COLUMN properties.zip_code IS 'Postal/ZIP code';
