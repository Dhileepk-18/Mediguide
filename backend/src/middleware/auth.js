import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { dbStore } from '../store/inMemoryStore.js';

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ success: false, message: 'Access token required' });
        return;
    }
    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        const user = dbStore.findUserById(decoded.id);
        if (!user) {
            res.status(401).json({ success: false, message: 'User associated with token not found' });
            return;
        }
        if (user.status === 'suspended') {
            res.status(403).json({ success: false, message: 'Account is suspended. Please contact admin.' });
            return;
        }
        req.user = user;
        next();
    } catch {
        res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
};

export const requireAuth = authenticateToken;

export const optionalAuthenticate = (req, _res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
        try {
            const decoded = jwt.verify(token, config.jwtSecret);
            const user = dbStore.findUserById(decoded.id);
            if (user && user.status !== 'suspended') {
                req.user = user;
            }
        } catch {
            // Continue without user
        }
    }
    next();
};

export const requireRoles = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: `Forbidden: requires one of the following roles: ${roles.join(', ')}`,
            });
            return;
        }
        next();
    };
};

export const requireRole = (roles) => requireRoles(Array.isArray(roles) ? roles : [roles]);
