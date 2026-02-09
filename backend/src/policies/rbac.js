export const checkRole = (allowedRoles) => {
    return async (req, reply) => {
        // Ensure user is authenticated first (req.user should exist from fastify-jwt)
        // If 'authenticate' decorator wasn't run, req.user might be missing.
        if (!req.user || !req.user.role) {
            return reply.code(401).send({ message: 'Authentication required' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return reply.code(403).send({ message: 'Access denied: Insufficient permissions' });
        }
    };
};
