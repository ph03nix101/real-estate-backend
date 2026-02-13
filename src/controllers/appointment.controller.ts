import { Request, Response } from 'express';
import { z } from 'zod';
import { query } from '../config/database.js';

// Validation schemas
const createAppointmentSchema = z.object({
    propertyId: z.string().uuid(),
    name: z.string().min(2).max(255),
    email: z.string().email().max(255),
    phone: z.string().max(50).optional(),
    preferred_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format
    preferred_time: z.string().regex(/^\d{2}:\d{2}$/), // HH:MM format
    message: z.string().max(2000).optional(),
});

const updateAppointmentStatusSchema = z.object({
    status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']),
});

/**
 * Create a new appointment (Public endpoint)
 */
export const createAppointment = async (req: Request, res: Response) => {
    try {
        const validatedData = createAppointmentSchema.parse(req.body);

        // Verify property exists
        const propertyCheck = await query(
            'SELECT id FROM properties WHERE id = $1',
            [validatedData.propertyId]
        );

        if (propertyCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Property not found' });
        }

        // Validate date is in the future
        const appointmentDate = new Date(validatedData.preferred_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (appointmentDate < today) {
            return res.status(400).json({ error: 'Appointment date must be in the future' });
        }

        // Create appointment
        const result = await query(
            `INSERT INTO appointments (property_id, name, email, phone, preferred_date, preferred_time, message, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
             RETURNING *`,
            [
                validatedData.propertyId,
                validatedData.name,
                validatedData.email,
                validatedData.phone || null,
                validatedData.preferred_date,
                validatedData.preferred_time,
                validatedData.message || null,
            ]
        );

        res.status(201).json({
            message: 'Appointment request submitted successfully',
            appointment: result.rows[0],
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Validation error', details: error.errors });
        }
        console.error('Create appointment error:', error);
        res.status(500).json({ error: 'Failed to submit appointment request' });
    }
};

/**
 * Get all appointments for agent's properties
 */
export const getAgentAppointments = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { status, propertyId } = req.query;

        let queryText = `
            SELECT 
                a.*,
                p.title as property_title,
                p.city as property_city,
                p.state as property_state,
                p.location as property_location
            FROM appointments a
            JOIN properties p ON a.property_id = p.id
            WHERE p.agent_id = $1
        `;
        const params: any[] = [userId];

        // Filter by status if provided
        if (status) {
            params.push(status);
            queryText += ` AND a.status = $${params.length}`;
        }

        // Filter by property if provided
        if (propertyId) {
            params.push(propertyId);
            queryText += ` AND a.property_id = $${params.length}`;
        }

        queryText += ' ORDER BY a.preferred_date ASC, a.preferred_time ASC';

        const result = await query(queryText, params);

        res.json({
            appointments: result.rows,
            total: result.rows.length,
        });
    } catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({ error: 'Failed to fetch appointments' });
    }
};

/**
 * Get appointment by ID
 */
export const getAppointmentById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        const result = await query(
            `SELECT 
                a.*,
                p.title as property_title,
                p.city as property_city,
                p.state as property_state,
                p.location as property_location,
                p.agent_id
            FROM appointments a
            JOIN properties p ON a.property_id = p.id
            WHERE a.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        const appointment = result.rows[0];

        // Verify the agent owns this property
        if (appointment.agent_id !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(appointment);
    } catch (error) {
        console.error('Get appointment error:', error);
        res.status(500).json({ error: 'Failed to fetch appointment' });
    }
};

/**
 * Update appointment status
 */
export const updateAppointmentStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        const validatedData = updateAppointmentStatusSchema.parse(req.body);

        // Verify the agent owns this property
        const ownerCheck = await query(
            `SELECT a.id 
             FROM appointments a
             JOIN properties p ON a.property_id = p.id
             WHERE a.id = $1 AND p.agent_id = $2`,
            [id, userId]
        );

        if (ownerCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Appointment not found or access denied' });
        }

        // Update appointment status
        const result = await query(
            `UPDATE appointments 
             SET status = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2
             RETURNING *`,
            [validatedData.status, id]
        );

        res.json({
            message: 'Appointment status updated successfully',
            appointment: result.rows[0],
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Validation error', details: error.errors });
        }
        console.error('Update appointment error:', error);
        res.status(500).json({ error: 'Failed to update appointment' });
    }
};

/**
 * Delete appointment
 */
export const deleteAppointment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        // Verify the agent owns this property
        const ownerCheck = await query(
            `SELECT a.id 
             FROM appointments a
             JOIN properties p ON a.property_id = p.id
             WHERE a.id = $1 AND p.agent_id = $2`,
            [id, userId]
        );

        if (ownerCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Appointment not found or access denied' });
        }

        await query('DELETE FROM appointments WHERE id = $1', [id]);

        res.json({ message: 'Appointment deleted successfully' });
    } catch (error) {
        console.error('Delete appointment error:', error);
        res.status(500).json({ error: 'Failed to delete appointment' });
    }
};

/**
 * Get appointment statistics for agent dashboard
 */
export const getAppointmentStats = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;

        const result = await query(
            `SELECT 
                COUNT(*) as total_appointments,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_appointments,
                COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_appointments,
                COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_appointments,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_appointments,
                COUNT(CASE WHEN status = 'confirmed' AND preferred_date >= CURRENT_DATE THEN 1 END) as upcoming_appointments
            FROM appointments a
            JOIN properties p ON a.property_id = p.id
            WHERE p.agent_id = $1`,
            [userId]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get appointment stats error:', error);
        res.status(500).json({ error: 'Failed to fetch appointment statistics' });
    }
};
