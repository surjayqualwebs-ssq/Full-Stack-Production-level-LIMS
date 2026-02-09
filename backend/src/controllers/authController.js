import * as authService from '../services/authService.js';
import * as auditService from '../services/auditService.js';
import { ApiError, ConflictError, AuthorizationError } from '../errors/index.js';

export const register = async (req, reply) => {
    const { password, role } = req.body;
    let { email, name } = req.body;

    if (!email || !password || !name) {
        throw new ApiError(400, 'Email, password, and name are required');
    }

    email = email.trim().toLowerCase();
    name = name.trim();

    const safeRole = 'CLIENT';
    try {
        const user = await authService.register(email, password, name, safeRole);

        // Audit
        await auditService.logAction({
            userId: user.id,
            action: 'REGISTER',
            entityType: 'USER',
            entityId: user.id,
            ipAddress: req.ip
        });

        return reply.code(201).send(user);
    } catch (error) {
        if (error.message === 'User already exists') {
            throw new ConflictError(error.message);
        }
        throw error;
    }
};

export const login = async (req, reply) => {
    const { password } = req.body;
    let { email } = req.body;

    if (!email || !password) {
        throw new ApiError(400, 'Email and password are required');
    }

    email = email.trim().toLowerCase();

    try {
        const user = await authService.login(email, password);

        // Generate JWT
        const token = req.server.jwt.sign({
            id: user.id,
            role: user.role,
            email: user.email
        });

        // Audit
        await auditService.logAction({
            userId: user.id,
            action: 'LOGIN',
            entityType: 'USER',
            entityId: user.id,
            ipAddress: req.ip
        });

        return reply.send({ token, user });
    } catch (error) {
        if (error.message === 'Invalid email or password' || error.message === 'User is not active') {
            // Optional: Log failed login attempt here if we had the user ID or just logging IP
            throw new AuthorizationError('Invalid credentials');
        }
        throw error;
    }
};

export const me = async (req, reply) => {
    return reply.send(req.user);
};
