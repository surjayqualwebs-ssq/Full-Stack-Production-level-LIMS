import * as authController from '../controllers/authController.js';

export default async function authRoutes(fastify, opts) {
    fastify.post('/register', authController.register);
    fastify.post('/login', authController.login);

    fastify.get('/me', {
        onRequest: [fastify.authenticate] // We need to define this decorator
    }, authController.me);
}
