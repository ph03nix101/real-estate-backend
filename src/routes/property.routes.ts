import { Router } from 'express';
import {
    getAllProperties,
    getPropertyById,
    createProperty,
    updateProperty,
    deleteProperty,
    getAgentProperties,
} from '../controllers/property.controller.js';
import { uploadPropertyImages, deletePropertyImage } from '../controllers/upload.controller.js';
import { authenticateToken, requireAgent } from '../middleware/auth.middleware.js';
import { uploadMultiple } from '../middleware/upload.middleware.js';

const router = Router();

// Agent-specific routes (MUST come before /:id route)
router.get('/agent/my-properties', authenticateToken, requireAgent, getAgentProperties);

// Public routes
router.get('/', getAllProperties);
router.get('/:id', getPropertyById);

// Protected routes (agents only)
router.post('/', authenticateToken, requireAgent, createProperty);
router.put('/:id', authenticateToken, requireAgent, updateProperty);
router.delete('/:id', authenticateToken, requireAgent, deleteProperty);

// Image upload routes
router.post('/:id/images', authenticateToken, requireAgent, uploadMultiple, uploadPropertyImages);
router.delete('/:id/images', authenticateToken, requireAgent, deletePropertyImage);

export default router;
