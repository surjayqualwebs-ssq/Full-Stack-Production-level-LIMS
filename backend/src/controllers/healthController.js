export const check = async (req, reply) => {
    try {
        // Simple uptime check
        // Check DB connection if possible, strictly we just want app health
        const db = req.server.db; // Assuming db is decorated
        await db.sequelize.authenticate();

        return {
            status: 'UP',
            timestamp: new Date(),
            database: 'connected'
        };
    } catch (error) {
        req.log.error(error);
        return reply.code(503).send({
            status: 'DOWN',
            timestamp: new Date(),
            error: 'Database connection failed'
        });
    }
};
