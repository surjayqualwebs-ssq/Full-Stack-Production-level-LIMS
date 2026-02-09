import fp from 'fastify-plugin';

export default fp(async (fastify, opts) => {
    fastify.decorate('authenticate', async function (request, reply) {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.send(err);
        }
    });
});
