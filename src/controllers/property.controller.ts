import { Request, Response } from 'express';
import { z } from 'zod';
import { query } from '../config/database.js';

// Validation schemas
const createPropertySchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    location: z.string().min(1, 'Location is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    price: z.number().positive('Price must be positive'),
    beds: z.number().int().positive('Beds must be a positive integer'),
    baths: z.number().int().positive('Baths must be a positive integer'),
    sqft: z.number().int().positive('Square feet must be a positive integer'),
    propertyType: z.enum(['house', 'penthouse', 'villa', 'estate', 'loft']),
    yearBuilt: z.number().int().min(1800).max(new Date().getFullYear()),
    status: z.enum(['draft', 'active', 'pending', 'sold']).default('draft'),
    featured: z.boolean().default(false),
    amenities: z.array(z.string()).default([]),
    // Geocoding fields
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    address: z.string().optional(),
    zipCode: z.string().optional(),
});

const updatePropertySchema = createPropertySchema.partial();

// Get all properties (public - with filters)
export const getAllProperties = async (req: Request, res: Response) => {
    try {
        const {
            city,
            state,
            propertyType,
            minPrice,
            maxPrice,
            minBeds,
            status = 'active',
            featured,
            limit = '50',
            offset = '0'
        } = req.query;

        let queryText = `
      SELECT 
        p.id, p.title, p.description, p.location, p.city, p.state,
        p.price, p.beds, p.baths, p.sqft, p.property_type, p.year_built,
        p.status, p.featured, p.images, p.amenities, p.created_at, p.updated_at,
        p.latitude, p.longitude, p.address, p.zip_code,
        u.id as agent_id, u.first_name as agent_first_name, u.last_name as agent_last_name,
        u.email as agent_email, u.phone as agent_phone
      FROM properties p
      LEFT JOIN users u ON p.agent_id = u.id
      WHERE 1=1
    `;
        const params: any[] = [];
        let paramCount = 1;

        // Add filters
        if (status) {
            queryText += ` AND p.status = $${paramCount}`;
            params.push(status);
            paramCount++;
        }

        if (city) {
            queryText += ` AND LOWER(p.city) = LOWER($${paramCount})`;
            params.push(city);
            paramCount++;
        }

        if (state) {
            queryText += ` AND LOWER(p.state) = LOWER($${paramCount})`;
            params.push(state);
            paramCount++;
        }

        if (propertyType) {
            queryText += ` AND p.property_type = $${paramCount}`;
            params.push(propertyType);
            paramCount++;
        }

        if (minPrice) {
            queryText += ` AND p.price >= $${paramCount}`;
            params.push(minPrice);
            paramCount++;
        }

        if (maxPrice) {
            queryText += ` AND p.price <= $${paramCount}`;
            params.push(maxPrice);
            paramCount++;
        }

        if (minBeds) {
            queryText += ` AND p.beds >= $${paramCount}`;
            params.push(minBeds);
            paramCount++;
        }

        if (featured !== undefined) {
            queryText += ` AND p.featured = $${paramCount}`;
            params.push(featured === 'true');
            paramCount++;
        }

        queryText += ` ORDER BY p.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        params.push(parseInt(limit as string), parseInt(offset as string));

        const result = await query(queryText, params);

        const properties = result.rows.map(row => ({
            id: row.id,
            title: row.title,
            description: row.description,
            location: row.location,
            city: row.city,
            state: row.state,
            price: parseFloat(row.price),
            beds: row.beds,
            baths: row.baths,
            sqft: row.sqft,
            propertyType: row.property_type,
            yearBuilt: row.year_built,
            status: row.status,
            featured: row.featured,
            images: row.images || [],
            amenities: row.amenities || [],
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            latitude: row.latitude ? parseFloat(row.latitude) : null,
            longitude: row.longitude ? parseFloat(row.longitude) : null,
            address: row.address,
            zipCode: row.zip_code,
            agent: row.agent_id ? {
                id: row.agent_id,
                firstName: row.agent_first_name,
                lastName: row.agent_last_name,
                email: row.agent_email,
                phone: row.agent_phone,
            } : null,
        }));

        res.json({
            properties,
            count: properties.length,
            limit: parseInt(limit as string),
            offset: parseInt(offset as string),
        });
    } catch (error) {
        console.error('Get properties error:', error);
        res.status(500).json({
            error: 'Failed to fetch properties',
            message: 'An error occurred while fetching properties'
        });
    }
};

// Get single property by ID (public)
export const getPropertyById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const result = await query(
            `SELECT 
        p.*,
        u.id as agent_id, u.first_name as agent_first_name, u.last_name as agent_last_name,
        u.email as agent_email, u.phone as agent_phone, u.avatar_url as agent_avatar
      FROM properties p
      LEFT JOIN users u ON p.agent_id = u.id
      WHERE p.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Property not found',
                message: 'The requested property does not exist'
            });
        }

        const row = result.rows[0];
        const property = {
            id: row.id,
            title: row.title,
            description: row.description,
            location: row.location,
            city: row.city,
            state: row.state,
            price: parseFloat(row.price),
            beds: row.beds,
            baths: row.baths,
            sqft: row.sqft,
            propertyType: row.property_type,
            yearBuilt: row.year_built,
            status: row.status,
            featured: row.featured,
            images: row.images || [],
            amenities: row.amenities || [],
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            latitude: row.latitude ? parseFloat(row.latitude) : null,
            longitude: row.longitude ? parseFloat(row.longitude) : null,
            address: row.address,
            zipCode: row.zip_code,
            agent: row.agent_id ? {
                id: row.agent_id,
                firstName: row.agent_first_name,
                lastName: row.agent_last_name,
                email: row.agent_email,
                phone: row.agent_phone,
                avatar: row.agent_avatar,
            } : null,
        };

        res.json({ property });
    } catch (error) {
        console.error('Get property error:', error);
        res.status(500).json({
            error: 'Failed to fetch property',
            message: 'An error occurred while fetching the property'
        });
    }
};

// Create new property (agent only)
export const createProperty = async (req: Request, res: Response) => {
    try {
        const agentId = req.user?.userId;

        if (!agentId) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'User not authenticated'
            });
        }

        const validatedData = createPropertySchema.parse(req.body);

        const result = await query(
            `INSERT INTO properties (
        agent_id, title, description, location, city, state, price,
        beds, baths, sqft, property_type, year_built, status, featured, amenities,
        latitude, longitude, address, zip_code
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *`,
            [
                agentId,
                validatedData.title,
                validatedData.description,
                validatedData.location,
                validatedData.city,
                validatedData.state,
                validatedData.price,
                validatedData.beds,
                validatedData.baths,
                validatedData.sqft,
                validatedData.propertyType,
                validatedData.yearBuilt,
                validatedData.status,
                validatedData.featured,
                JSON.stringify(validatedData.amenities),
                validatedData.latitude || null,
                validatedData.longitude || null,
                validatedData.address || null,
                validatedData.zipCode || null,
            ]
        );

        const property = result.rows[0];

        res.status(201).json({
            message: 'Property created successfully',
            property: {
                id: property.id,
                title: property.title,
                description: property.description,
                location: property.location,
                city: property.city,
                state: property.state,
                price: parseFloat(property.price),
                beds: property.beds,
                baths: property.baths,
                sqft: property.sqft,
                propertyType: property.property_type,
                yearBuilt: property.year_built,
                status: property.status,
                featured: property.featured,
                images: property.images || [],
                amenities: property.amenities || [],
                createdAt: property.created_at,
                updatedAt: property.updated_at,
            },
        });
    } catch (error) {
        console.error('Create property error:', error);

        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: 'Validation error',
                details: error.errors
            });
        }

        res.status(500).json({
            error: 'Failed to create property',
            message: 'An error occurred while creating the property'
        });
    }
};

// Update property (agent only - own properties)
export const updateProperty = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const agentId = req.user?.userId;

        if (!agentId) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'User not authenticated'
            });
        }

        // Check if property exists and belongs to agent
        const existingProperty = await query(
            'SELECT * FROM properties WHERE id = $1',
            [id]
        );

        if (existingProperty.rows.length === 0) {
            return res.status(404).json({
                error: 'Property not found',
                message: 'The requested property does not exist'
            });
        }

        // Check ownership (unless admin)
        if (existingProperty.rows[0].agent_id !== agentId && req.user?.role !== 'admin') {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'You do not have permission to update this property'
            });
        }

        const validatedData = updatePropertySchema.parse(req.body);

        // Build update query dynamically
        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        Object.entries(validatedData).forEach(([key, value]) => {
            if (value !== undefined) {
                const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
                if (key === 'amenities') {
                    updates.push(`${dbKey} = $${paramCount}`);
                    values.push(JSON.stringify(value));
                } else if (key === 'propertyType') {
                    updates.push(`property_type = $${paramCount}`);
                    values.push(value);
                } else {
                    updates.push(`${dbKey} = $${paramCount}`);
                    values.push(value);
                }
                paramCount++;
            }
        });

        if (updates.length === 0) {
            return res.status(400).json({
                error: 'No updates provided',
                message: 'No valid fields to update'
            });
        }

        values.push(id);

        const result = await query(
            `UPDATE properties SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $${paramCount}
       RETURNING *`,
            values
        );

        const property = result.rows[0];

        res.json({
            message: 'Property updated successfully',
            property: {
                id: property.id,
                title: property.title,
                description: property.description,
                location: property.location,
                city: property.city,
                state: property.state,
                price: parseFloat(property.price),
                beds: property.beds,
                baths: property.baths,
                sqft: property.sqft,
                propertyType: property.property_type,
                yearBuilt: property.year_built,
                status: property.status,
                featured: property.featured,
                images: property.images || [],
                amenities: property.amenities || [],
                latitude: property.latitude ? parseFloat(property.latitude) : null,
                longitude: property.longitude ? parseFloat(property.longitude) : null,
                address: property.address,
                zipCode: property.zip_code,
                createdAt: property.created_at,
                updatedAt: property.updated_at,
            },
        });
    } catch (error) {
        console.error('Update property error:', error);

        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: 'Validation error',
                details: error.errors
            });
        }

        res.status(500).json({
            error: 'Failed to update property',
            message: 'An error occurred while updating the property'
        });
    }
};

// Delete property (agent only - own properties)
export const deleteProperty = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const agentId = req.user?.userId;

        if (!agentId) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'User not authenticated'
            });
        }

        // Check if property exists and belongs to agent
        const existingProperty = await query(
            'SELECT * FROM properties WHERE id = $1',
            [id]
        );

        if (existingProperty.rows.length === 0) {
            return res.status(404).json({
                error: 'Property not found',
                message: 'The requested property does not exist'
            });
        }

        // Check ownership (unless admin)
        if (existingProperty.rows[0].agent_id !== agentId && req.user?.role !== 'admin') {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'You do not have permission to delete this property'
            });
        }

        await query('DELETE FROM properties WHERE id = $1', [id]);

        res.json({
            message: 'Property deleted successfully',
        });
    } catch (error) {
        console.error('Delete property error:', error);
        res.status(500).json({
            error: 'Failed to delete property',
            message: 'An error occurred while deleting the property'
        });
    }
};

// Get agent's own properties
export const getAgentProperties = async (req: Request, res: Response) => {
    try {
        const agentId = req.user?.userId;

        if (!agentId) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'User not authenticated'
            });
        }

        const result = await query(
            `SELECT * FROM properties 
       WHERE agent_id = $1 
       ORDER BY created_at DESC`,
            [agentId]
        );

        const properties = result.rows.map(row => ({
            id: row.id,
            title: row.title,
            description: row.description,
            location: row.location,
            city: row.city,
            state: row.state,
            price: parseFloat(row.price),
            beds: row.beds,
            baths: row.baths,
            sqft: row.sqft,
            propertyType: row.property_type,
            yearBuilt: row.year_built,
            status: row.status,
            featured: row.featured,
            images: row.images || [],
            amenities: row.amenities || [],
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        }));

        res.json({
            properties,
            count: properties.length,
        });
    } catch (error) {
        console.error('Get agent properties error:', error);
        res.status(500).json({
            error: 'Failed to fetch properties',
            message: 'An error occurred while fetching your properties'
        });
    }
};
