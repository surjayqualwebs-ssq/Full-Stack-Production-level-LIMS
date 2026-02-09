import * as healthController from '../controllers/healthController.js';

export default async function healthRoutes(fastify, opts) {
    fastify.get('/health', healthController.check);
    // Deprecate the old inline one in app.js or let this override/coexist
}
