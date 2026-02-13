import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import {
    createInquiry,
    getAgentInquiries,
    getInquiryById,
    updateInquiryStatus,
    deleteInquiry,
    getInquiryStats,
} from '../controllers/inquiry.controller';

const router = Router();

// Public routes
router.post('/', createInquiry);

// Protected routes (agent only)
router.get('/', authenticateToken, getAgentInquiries);
router.get('/stats', authenticateToken, getInquiryStats);
router.get('/:id', authenticateToken, getInquiryById);
router.put('/:id/status', authenticateToken, updateInquiryStatus);
router.delete('/:id', authenticateToken, deleteInquiry);

export default router;
