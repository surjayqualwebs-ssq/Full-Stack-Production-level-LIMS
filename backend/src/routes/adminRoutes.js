import * as adminController from '../controllers/adminController.js';
import { checkRole } from '../policies/rbac.js';

export default async function adminRoutes(fastify, opts) {
    fastify.addHook('onRequest', fastify.authenticate);

    // Profile Management
    fastify.get('/me', { preHandler: checkRole(['ADMIN']) }, adminController.getProfile);
    fastify.patch('/me', { preHandler: checkRole(['ADMIN']) }, adminController.updateProfile);

    // User Management
    fastify.get('/users', { preHandler: checkRole(['ADMIN']) }, adminController.getAllUsers);
    fastify.post('/users', { preHandler: checkRole(['ADMIN']) }, adminController.createInternalUser);

    // Edit any user profile
    fastify.put('/users/:id/profile', { preHandler: checkRole(['ADMIN']) }, adminController.updateUserProfile);

    // Case Management
    fastify.get('/cases', { preHandler: checkRole(['ADMIN']) }, adminController.getAllCases);
}
