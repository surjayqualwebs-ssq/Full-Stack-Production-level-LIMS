import fp from 'fastify-plugin';
import db from '../models/index.js';

export default fp(async (fastify, opts) => {
    try {
        await db.sequelize.authenticate();
        fastify.log.info('Database connection has been established successfully.');

        // Attach db to fastify instance
        fastify.decorate('db', db);

        fastify.addHook('onClose', async (instance) => {
            await db.sequelize.close();
        });
    } catch (error) {
        fastify.log.error('Unable to connect to the database:', error);
        throw error;
    }
});
