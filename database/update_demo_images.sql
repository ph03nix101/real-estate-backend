-- Update demo properties with image paths
-- This links the copied demo images to the database records

DO $$
DECLARE
    property_record RECORD;
BEGIN
    -- Update each property with its corresponding image
    -- Property 1: Meerlust Manor (property-1.jpg)
    UPDATE properties 
    SET images = '["/uploads/properties/property-1.jpg"]'::jsonb
    WHERE title = 'Meerlust Manor';

    -- Property 2: Sunset Penthouse (property-2.jpg)
    UPDATE properties 
    SET images = '["/uploads/properties/property-2.jpg"]'::jsonb
    WHERE title = 'Sunset Penthouse';

    -- Property 3: Mountain Vista Estate (property-3.jpg)
    UPDATE properties 
    SET images = '["/uploads/properties/property-3.jpg"]'::jsonb
    WHERE title = 'Mountain Vista Estate';

    -- Property 4: Urban Loft (property-4.jpg)
    UPDATE properties 
    SET images = '["/uploads/properties/property-4.jpg"]'::jsonb
    WHERE title = 'Urban Loft';

    -- Property 5: Lakeside Retreat (property-5.jpg)
    UPDATE properties 
    SET images = '["/uploads/properties/property-5.jpg"]'::jsonb
    WHERE title = 'Lakeside Retreat';

    -- Property 6: Beverly Hills Manor (property-6.jpg)
    UPDATE properties 
    SET images = '["/uploads/properties/property-6.jpg"]'::jsonb
    WHERE title = 'Beverly Hills Manor';

    RAISE NOTICE 'Successfully updated all 6 demo properties with images';
END $$;

-- Verify the update
SELECT title, images FROM properties ORDER BY created_at;
