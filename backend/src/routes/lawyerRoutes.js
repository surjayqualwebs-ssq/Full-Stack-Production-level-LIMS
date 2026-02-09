import * as lawyerController from '../controllers/lawyerController.js';
import { checkRole } from '../policies/rbac.js';

export default async function lawyerRoutes(fastify, opts) {
    fastify.addHook('onRequest', fastify.authenticate);

    fastify.get('/me', { preHandler: checkRole(['LAWYER']) }, lawyerController.getProfile);
    fastify.patch('/me', { preHandler: checkRole(['LAWYER']) }, lawyerController.updateProfile);
    fastify.get('/cases', { preHandler: checkRole(['LAWYER']) }, lawyerController.getMyCases);
    fastify.patch('/cases/:id', { preHandler: checkRole(['LAWYER']) }, lawyerController.updateCaseDetails);
}
