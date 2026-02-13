import { Request, Response } from 'express';
import { z } from 'zod';
import { query } from '../config/database.js';

// Validation schemas
const createInquirySchema = z.object({
    propertyId: z.string().uuid(),
    name: z.string().min(2).max(255),
    email: z.string().email().max(255),
    phone: z.string().max(50).optional(),
    message: z.string().min(10).max(2000),
});

const updateInquiryStatusSchema = z.object({
    status: z.enum(['new', 'contacted', 'scheduled', 'closed']),
});

/**
 * Create a new inquiry (Public endpoint)
 */
export const createInquiry = async (req: Request, res: Response) => {
    try {
        const validatedData = createInquirySchema.parse(req.body);

        // Verify property exists
        const propertyCheck = await query(
            'SELECT id FROM properties WHERE id = $1',
            [validatedData.propertyId]
        );

        if (propertyCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Property not found' });
        }

        // Create inquiry
        const result = await query(
            `INSERT INTO inquiries (property_id, name, email, phone, message, status)
             VALUES ($1, $2, $3, $4, $5, 'new')
             RETURNING *`,
            [
                validatedData.propertyId,
                validatedData.name,
                validatedData.email,
                validatedData.phone || null,
                validatedData.message,
            ]
        );

        res.status(201).json({
            message: 'Inquiry submitted successfully',
            inquiry: result.rows[0],
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Validation error', details: error.errors });
        }
        console.error('Create inquiry error:', error);
        res.status(500).json({ error: 'Failed to submit inquiry' });
    }
};

/**
 * Get all inquiries for agent's properties
 */
export const getAgentInquiries = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { status, propertyId } = req.query;

        let queryText = `
            SELECT 
                i.*,
                p.title as property_title,
                p.city as property_city,
                p.state as property_state
            FROM inquiries i
            JOIN properties p ON i.property_id = p.id
            WHERE p.agent_id = $1
        `;
        const params: any[] = [userId];

        // Filter by status if provided
        if (status) {
            params.push(status);
            queryText += ` AND i.status = $${params.length}`;
        }

        // Filter by property if provided
        if (propertyId) {
            params.push(propertyId);
            queryText += ` AND i.property_id = $${params.length}`;
        }

        queryText += ' ORDER BY i.created_at DESC';

        const result = await query(queryText, params);

        res.json({
            inquiries: result.rows,
            total: result.rows.length,
        });
    } catch (error) {
        console.error('Get inquiries error:', error);
        res.status(500).json({ error: 'Failed to fetch inquiries' });
    }
};

/**
 * Get inquiry by ID
 */
export const getInquiryById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        const result = await query(
            `SELECT 
                i.*,
                p.title as property_title,
                p.city as property_city,
                p.state as property_state,
                p.agent_id
            FROM inquiries i
            JOIN properties p ON i.property_id = p.id
            WHERE i.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Inquiry not found' });
        }

        const inquiry = result.rows[0];

        // Verify the agent owns this property
        if (inquiry.agent_id !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(inquiry);
    } catch (error) {
        console.error('Get inquiry error:', error);
        res.status(500).json({ error: 'Failed to fetch inquiry' });
    }
};

/**
 * Update inquiry status
 */
export const updateInquiryStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        const validatedData = updateInquiryStatusSchema.parse(req.body);

        // Verify the agent owns this property
        const ownerCheck = await query(
            `SELECT i.id 
             FROM inquiries i
             JOIN properties p ON i.property_id = p.id
             WHERE i.id = $1 AND p.agent_id = $2`,
            [id, userId]
        );

        if (ownerCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Inquiry not found or access denied' });
        }

        // Update inquiry status
        const result = await query(
            `UPDATE inquiries 
             SET status = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2
             RETURNING *`,
            [validatedData.status, id]
        );

        res.json({
            message: 'Inquiry status updated successfully',
            inquiry: result.rows[0],
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Validation error', details: error.errors });
        }
        console.error('Update inquiry error:', error);
        res.status(500).json({ error: 'Failed to update inquiry' });
    }
};

/**
 * Delete inquiry
 */
export const deleteInquiry = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        // Verify the agent owns this property
        const ownerCheck = await query(
            `SELECT i.id 
             FROM inquiries i
             JOIN properties p ON i.property_id = p.id
             WHERE i.id = $1 AND p.agent_id = $2`,
            [id, userId]
        );

        if (ownerCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Inquiry not found or access denied' });
        }

        await query('DELETE FROM inquiries WHERE id = $1', [id]);

        res.json({ message: 'Inquiry deleted successfully' });
    } catch (error) {
        console.error('Delete inquiry error:', error);
        res.status(500).json({ error: 'Failed to delete inquiry' });
    }
};

/**
 * Get inquiry statistics for agent dashboard
 */
export const getInquiryStats = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;

        const result = await query(
            `SELECT 
                COUNT(*) as total_inquiries,
                COUNT(CASE WHEN status = 'new' THEN 1 END) as new_inquiries,
                COUNT(CASE WHEN status = 'contacted' THEN 1 END) as contacted_inquiries,
                COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled_inquiries,
                COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_inquiries
            FROM inquiries i
            JOIN properties p ON i.property_id = p.id
            WHERE p.agent_id = $1`,
            [userId]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get inquiry stats error:', error);
        res.status(500).json({ error: 'Failed to fetch inquiry statistics' });
    }
};
