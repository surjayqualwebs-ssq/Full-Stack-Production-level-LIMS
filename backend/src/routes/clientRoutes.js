import * as clientController from '../controllers/clientController.js';
import { checkRole } from '../policies/rbac.js';

export default async function clientRoutes(fastify, opts) {
    // Add authentication and Authorization hooks to all routes in this plugin
    fastify.addHook('onRequest', fastify.authenticate);

    fastify.get('/me', {
        preHandler: checkRole(['CLIENT'])
    }, clientController.getProfile);

    fastify.patch('/me', {
        preHandler: checkRole(['CLIENT'])
    }, clientController.updateProfile);

    // Intake Routes
    fastify.post('/intakes', { preHandler: checkRole(['CLIENT']) }, clientController.submitIntake);
    fastify.get('/intakes', { preHandler: checkRole(['CLIENT']) }, clientController.getMyIntakes);
    fastify.get('/intakes/:id', { preHandler: checkRole(['CLIENT']) }, clientController.getIntakeById);
    fastify.patch('/intakes/:id', { preHandler: checkRole(['CLIENT']) }, clientController.updateIntake);

    // Case Routes
    fastify.get('/cases', { preHandler: checkRole(['CLIENT']) }, clientController.getMyCases);
    fastify.post('/cases/:id/rate', { preHandler: checkRole(['CLIENT']) }, clientController.rateLawyer);
}
