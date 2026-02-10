import * as lawyerController from '../controllers/lawyerController.js';
import { checkRole } from '../policies/rbac.js';

export default async function lawyerRoutes(fastify, opts) {
    fastify.addHook('onRequest', fastify.authenticate);

    fastify.get('/me', { preHandler: checkRole(['LAWYER']) }, lawyerController.getProfile);
    fastify.patch('/me', { preHandler: checkRole(['LAWYER']) }, lawyerController.updateProfile);
    fastify.get('/cases', { preHandler: checkRole(['LAWYER']) }, lawyerController.getMyCases);
    fastify.get('/cases/upcoming', { preHandler: checkRole(['LAWYER']) }, lawyerController.getUpcomingHearings); // Specific route before param route? Actually /cases/:id is not defined here yet, only PATCH /cases/:id. 
    // But if we had GET /cases/:id it would matter. logic is fine.

    fastify.patch('/cases/:id', { preHandler: checkRole(['LAWYER']) }, lawyerController.updateCaseDetails);
    fastify.put('/cases/:id/status', { preHandler: checkRole(['LAWYER']) }, lawyerController.updateCaseStatus);

    // Tasks Routes
    fastify.get('/tasks', { preHandler: checkRole(['LAWYER']) }, lawyerController.getTasks);
    fastify.get('/tasks/upcoming', { preHandler: checkRole(['LAWYER']) }, lawyerController.getUpcomingTasks);
    fastify.post('/tasks', { preHandler: checkRole(['LAWYER']) }, lawyerController.createTask);
    fastify.put('/tasks/:id', { preHandler: checkRole(['LAWYER']) }, lawyerController.updateTask);
    fastify.delete('/tasks/:id', { preHandler: checkRole(['LAWYER']) }, lawyerController.deleteTask);
}
