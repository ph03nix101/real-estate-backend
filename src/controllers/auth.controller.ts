import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { query } from '../config/database.js';

// Validation schemas
const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().optional(),
    role: z.enum(['user', 'agent', 'admin']).default('user'),
});

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

// Helper function to generate JWT token
const generateToken = (userId: string, email: string, role: string): string => {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    return jwt.sign(
        { userId, email, role },
        secret,
        { expiresIn }
    );
};

// Register new user
export const register = async (req: Request, res: Response) => {
    try {
        // Validate request body
        const validatedData = registerSchema.parse(req.body);
        const { email, password, firstName, lastName, phone, role } = validatedData;

        // Check if user already exists
        const existingUser = await query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                error: 'User already exists',
                message: 'An account with this email already exists'
            });
        }

        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Insert user into database
        const result = await query(
            `INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, first_name, last_name, phone, role, created_at`,
            [email, passwordHash, firstName, lastName, phone, role]
        );

        const user = result.rows[0];

        // Generate JWT token
        const token = generateToken(user.id, user.email, user.role);

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                phone: user.phone,
                role: user.role,
                createdAt: user.created_at,
            },
            token,
        });
    } catch (error) {
        console.error('Registration error:', error);

        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: 'Validation error',
                details: error.errors
            });
        }

        res.status(500).json({
            error: 'Registration failed',
            message: 'An error occurred during registration'
        });
    }
};

// Login user
export const login = async (req: Request, res: Response) => {
    try {
        // Validate request body
        const validatedData = loginSchema.parse(req.body);
        const { email, password } = validatedData;

        // Find user by email
        const result = await query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Email or password is incorrect'
            });
        }

        const user = result.rows[0];

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Email or password is incorrect'
            });
        }

        // Generate JWT token
        const token = generateToken(user.id, user.email, user.role);

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                phone: user.phone,
                role: user.role,
            },
            token,
        });
    } catch (error) {
        console.error('Login error:', error);

        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: 'Validation error',
                details: error.errors
            });
        }

        res.status(500).json({
            error: 'Login failed',
            message: 'An error occurred during login'
        });
    }
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response) => {
    try {
        // User ID is set by auth middleware
        const userId = (req as any).user?.userId;

        if (!userId) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'No user found in request'
            });
        }

        const result = await query(
            'SELECT id, email, first_name, last_name, phone, role, avatar_url, created_at FROM users WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'User not found',
                message: 'User does not exist'
            });
        }

        const user = result.rows[0];

        res.json({
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                phone: user.phone,
                role: user.role,
                avatarUrl: user.avatar_url,
                createdAt: user.created_at,
            },
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            error: 'Failed to get user',
            message: 'An error occurred while fetching user data'
        });
    }
};
