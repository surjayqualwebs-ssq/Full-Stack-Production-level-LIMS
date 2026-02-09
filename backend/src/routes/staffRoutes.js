import * as staffController from '../controllers/staffController.js';
import { checkRole } from '../policies/rbac.js';

export default async function staffRoutes(fastify, opts) {
    fastify.addHook('onRequest', fastify.authenticate);

    fastify.get('/me', { preHandler: checkRole(['STAFF']) }, staffController.getProfile);
    fastify.patch('/me', { preHandler: checkRole(['STAFF']) }, staffController.updateProfile);

    // Intake Operations
    fastify.get('/intakes/pending', { preHandler: checkRole(['STAFF']) }, staffController.getPendingIntakes);
    fastify.post('/intakes/:id/review', { preHandler: checkRole(['STAFF']) }, staffController.reviewIntake);
}
