import { Router } from 'express';
import {
    createAppointment,
    getAgentAppointments,
    getAppointmentById,
    updateAppointmentStatus,
    deleteAppointment,
    getAppointmentStats
} from '../controllers/appointment.controller.js';
import { authenticateToken, requireAgent } from '../middleware/auth.middleware.js';

const router = Router();

// Public route to book an appointment
router.post('/', createAppointment);

// Protected routes (Agent only)
router.get('/', authenticateToken, requireAgent, getAgentAppointments);
router.get('/stats', authenticateToken, requireAgent, getAppointmentStats);
router.get('/:id', authenticateToken, requireAgent, getAppointmentById);
router.put('/:id/status', authenticateToken, requireAgent, updateAppointmentStatus);
router.delete('/:id', authenticateToken, requireAgent, deleteAppointment);

export default router;
