import jwt from 'jsonwebtoken';
import { prisma } from '../prisma.js';
const JWT_SECRET = process.env.JWT_SECRET || 'voltedge-super-secret-jwt-key-milestone-2-2026';
export function generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}
export async function verifyAdminToken(req, res, next) {
    try {
        let token;
        // Check Authorization Header
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
        else if (req.cookies && req.cookies.admin_token) {
            token = req.cookies.admin_token;
        }
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. No valid administrator session found.',
            });
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        // Verify user exists and is active in database
        const user = await prisma.adminUser.findUnique({
            where: { id: decoded.id },
        });
        if (!user || !user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Staff account is inactive or no longer authorized.',
            });
        }
        req.admin = {
            id: user.id,
            email: user.email,
            role: user.role,
            fullName: user.fullName,
        };
        next();
    }
    catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Administrator session expired. Please log in again.',
            });
        }
        return res.status(401).json({
            success: false,
            message: 'Invalid or forged authentication token.',
        });
    }
}
export function requireRole(allowedRoles) {
    return (req, res, next) => {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.',
            });
        }
        // Super Admin has universal permission
        if (req.admin.role === 'SUPER_ADMIN') {
            return next();
        }
        if (!allowedRoles.includes(req.admin.role)) {
            return res.status(403).json({
                success: false,
                message: `Forbidden: Staff role "${req.admin.role}" lacks permission for this operation.`,
            });
        }
        next();
    };
}
// In-memory rate limiter for login protection
const loginAttempts = new Map();
export function loginRateLimiter(req, res, next) {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxAttempts = 10;
    const record = loginAttempts.get(ip);
    if (record) {
        if (now - record.lastAttempt > windowMs) {
            loginAttempts.set(ip, { count: 1, lastAttempt: now });
        }
        else {
            if (record.count >= maxAttempts) {
                return res.status(429).json({
                    success: false,
                    message: 'Too many failed login attempts. Please wait 15 minutes before trying again.',
                });
            }
            record.count += 1;
            record.lastAttempt = now;
            loginAttempts.set(ip, record);
        }
    }
    else {
        loginAttempts.set(ip, { count: 1, lastAttempt: now });
    }
    next();
}
export function resetLoginAttempts(ip) {
    loginAttempts.delete(ip);
}
