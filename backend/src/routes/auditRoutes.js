import * as auditController from '../controllers/auditController.js';

export default async function auditRoutes(fastify, opts) {
    fastify.addHook('onRequest', fastify.authenticate);

    // Get logs (RBAC handled in controller)
    fastify.get('/logs', auditController.getLogs);
}
