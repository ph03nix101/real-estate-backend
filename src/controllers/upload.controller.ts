import { Request, Response } from 'express';
import { query } from '../config/database.js';

// Upload images for a property
export const uploadPropertyImages = async (req: Request, res: Response) => {
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

        // Get uploaded files
        const files = req.files as Express.Multer.File[];

        if (!files || files.length === 0) {
            return res.status(400).json({
                error: 'No files uploaded',
                message: 'Please select at least one image to upload'
            });
        }

        // Generate URLs for uploaded images
        const imageUrls = files.map(file => `/uploads/properties/${file.filename}`);

        // Get existing images
        const currentImages = existingProperty.rows[0].images || [];

        // Combine existing and new images
        const allImages = [...currentImages, ...imageUrls];

        // Update property with new images
        await query(
            'UPDATE properties SET images = $1, updated_at = NOW() WHERE id = $2',
            [JSON.stringify(allImages), id]
        );

        res.json({
            message: 'Images uploaded successfully',
            images: allImages,
            uploadedCount: files.length,
        });
    } catch (error) {
        console.error('Upload images error:', error);
        res.status(500).json({
            error: 'Failed to upload images',
            message: 'An error occurred while uploading images'
        });
    }
};

// Delete an image from a property
export const deletePropertyImage = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { imageUrl } = req.body;
        const agentId = req.user?.userId;

        if (!agentId) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'User not authenticated'
            });
        }

        if (!imageUrl) {
            return res.status(400).json({
                error: 'Missing image URL',
                message: 'Please provide the image URL to delete'
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

        // Get current images
        const currentImages = existingProperty.rows[0].images || [];

        // Remove the specified image
        const updatedImages = currentImages.filter((img: string) => img !== imageUrl);

        // Update property
        await query(
            'UPDATE properties SET images = $1, updated_at = NOW() WHERE id = $2',
            [JSON.stringify(updatedImages), id]
        );

        // TODO: Optionally delete the actual file from disk
        // const fs = require('fs');
        // const path = require('path');
        // const filePath = path.join(__dirname, '../../', imageUrl);
        // if (fs.existsSync(filePath)) {
        //   fs.unlinkSync(filePath);
        // }

        res.json({
            message: 'Image deleted successfully',
            images: updatedImages,
        });
    } catch (error) {
        console.error('Delete image error:', error);
        res.status(500).json({
            error: 'Failed to delete image',
            message: 'An error occurred while deleting the image'
        });
    }
};
