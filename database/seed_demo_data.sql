-- Seed database with demo properties
-- This will add sample properties to showcase the platform

-- First, let's get or create a demo agent user
DO $$
DECLARE
    demo_agent_id UUID;
BEGIN
    -- Check if demo agent exists, if not create one
    SELECT id INTO demo_agent_id FROM users WHERE email = 'demo.agent@luxeterritory.com';
    
    IF demo_agent_id IS NULL THEN
        INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
        VALUES (
            'demo.agent@luxeterritory.com',
            '$2b$10$demo.hash.placeholder.only.for.demo.purposes',
            'James',
            'Davidson',
            '(555) 123-4567',
            'agent'
        )
        RETURNING id INTO demo_agent_id;
    END IF;

    -- Insert demo properties
    -- Property 1: Meerlust Manor
    INSERT INTO properties (
        agent_id, title, description, location, city, state, price, beds, baths, sqft,
        property_type, year_built, status, featured, amenities
    ) VALUES (
        demo_agent_id,
        'Meerlust Manor',
        'Experience unparalleled luxury in this stunning oceanfront estate. This architectural masterpiece features floor-to-ceiling windows, designer finishes, and breathtaking views. The gourmet kitchen, spa-like bathrooms, and multiple entertainment spaces make this the ultimate coastal retreat.',
        '1234 Ocean Boulevard',
        'Malibu',
        'CA',
        5500000,
        5,
        6,
        6800,
        'villa',
        2022,
        'active',
        true,
        '["Pool", "Gym", "Security", "Air Conditioning", "Heating", "Ocean View", "Private Beach Access", "Wine Cellar", "Home Theater"]'::jsonb
    );

    -- Property 2: Sunset Penthouse
    INSERT INTO properties (
        agent_id, title, description, location, city, state, price, beds, baths, sqft,
        property_type, year_built, status, featured, amenities
    ) VALUES (
        demo_agent_id,
        'Sunset Penthouse',
        'Crown jewel penthouse with panoramic city views. This modern luxury residence features an open floorplan, chef''s kitchen, and private rooftop terrace. Smart home technology throughout, premium appliances, and designer finishes at every turn.',
        '789 Skyline Drive',
        'Miami',
        'FL',
        3200000,
        4,
        4,
        4200,
        'penthouse',
        2021,
        'active',
        true,
        '["Elevator", "Parking", "Balcony", "Air Conditioning", "Security", "Concierge", "Rooftop Access", "Smart Home"]'::jsonb
    );

    -- Property 3: Mountain Vista Estate
    INSERT INTO properties (
        agent_id, title, description, location, city, state, price, beds, baths, sqft,
        property_type, year_built, status, featured, amenities
    ) VALUES (
        demo_agent_id,
        'Mountain Vista Estate',
        'Magnificent mountain estate offering privacy and luxury. Nestled in pristine wilderness with stunning mountain views. Features include a grand living room with vaulted ceilings, gourmet kitchen, multiple fireplaces, and extensive outdoor living spaces.',
        '456 Alpine Ridge',
        'Aspen',
        'CO',
        7800000,
        6,
        7,
        8500,
        'estate',
        2020,
        'active',
        false,
        '["Fireplace", "Heating", "Parking", "Garden", "Mountain View", "Ski Access", "Wine Cellar", "Home Theater", "Gym"]'::jsonb
    );

    -- Property 4: Urban Loft
    INSERT INTO properties (
        agent_id, title, description, location, city, state, price, beds, baths, sqft,
        property_type, year_built, status, featured, amenities
    ) VALUES (
        demo_agent_id,
        'Urban Loft',
        'Sophisticated downtown loft with industrial chic design. Soaring ceilings, exposed brick, and oversized windows create a bright, open living space. Perfect for the urban professional seeking style and convenience.',
        '321 Downtown Street',
        'New York',
        'NY',
        2100000,
        2,
        2,
        2100,
        'loft',
        2019,
        'active',
        false,
        '["Elevator", "Parking", "Air Conditioning", "Security", "Exposed Brick", "High Ceilings"]'::jsonb
    );

    -- Property 5: Lakeside Retreat
    INSERT INTO properties (
        agent_id, title, description, location, city, state, price, beds, baths, sqft,
        property_type, year_built, status, featured, amenities
    ) VALUES (
        demo_agent_id,
        'Lakeside Retreat',
        'Tranquil lakefront estate perfect for relaxation and entertaining. Private dock, sandy beach, and expansive outdoor living areas. The interior features warm woods, stone fireplaces, and walls of glass to embrace the stunning water views.',
        '789 Lakeshore Drive',
        'Lake Tahoe',
        'NV',
        4500000,
        5,
        5,
        5200,
        'house',
        2018,
        'active',
        true,
        '["Lake Access", "Private Dock", "Fireplace", "Garden", "Heating", "Beach Access", "Outdoor Kitchen"]'::jsonb
    );

    -- Property 6: Beverly Hills Manor
    INSERT INTO properties (
        agent_id, title, description, location, city, state, price, beds, baths, sqft,
        property_type, year_built, status, featured, amenities
    ) VALUES (
        demo_agent_id,
        'Beverly Hills Manor',
        'Iconic Beverly Hills estate epitomizing California luxury living. Gated and private with lush landscaping, resort-style pool, and multiple entertaining spaces. Chef''s kitchen, home theater, and spa create the ultimate lifestyle.',
        '1000 Rodeo Drive',
        'Beverly Hills',
        'CA',
        12500000,
        7,
        9,
        11000,
        'estate',
        2023,
        'active',
        true,
        '["Pool", "Gym", "Security", "Parking", "Garden", "Home Theater", "Wine Cellar", "Guest House", "Tennis Court"]'::jsonb
    );

    RAISE NOTICE 'Successfully inserted 6 demo properties for agent %', demo_agent_id;
END $$;
