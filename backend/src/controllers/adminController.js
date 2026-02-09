import * as adminService from '../services/adminService.js';
import * as caseService from '../services/caseService.js';
import { NotFoundError, ApiError, ConflictError } from '../errors/index.js';

export const getProfile = async (req, reply) => {
    const userId = req.user.id;
    const profile = await adminService.getProfile(userId);
    if (!profile) throw new NotFoundError('Profile not found');
    return reply.send(profile);
};

export const updateProfile = async (req, reply) => {
    const userId = req.user.id;
    const profile = await adminService.updateProfile(userId, req.body);
    return reply.send({ message: 'Profile updated', profile });
};

export const createInternalUser = async (req, reply) => {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name || !role) {
        throw new ApiError(400, 'Email, password, name, and role are required');
    }

    const allowedRoles = ['LAWYER', 'STAFF', 'ADMIN'];
    if (!allowedRoles.includes(role)) {
        throw new ApiError(400, 'Invalid role for internal user creation');
    }

    try {
        const newUser = await adminService.createInternalUser(req.body);
        return reply.code(201).send({ message: 'User created successfully', userId: newUser.id });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            throw new ConflictError('Email already exists');
        }
        throw error;
    }
};

export const getAllUsers = async (req, reply) => {
    const users = await adminService.getAllUsers();
    return reply.send(users);
};

export const getAllCases = async (req, reply) => {
    const cases = await caseService.getAllCases();
    return reply.send(cases);
};

export const updateUserProfile = async (req, reply) => {
    const { id } = req.params;
    const data = req.body;
    await adminService.updateAnyUserProfile(id, data);
    return reply.send({ message: 'User profile updated successfully' });
};
