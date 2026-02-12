import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
// import cors from '@fastify/cors';

const buildApp = async (opts = {}) => {
    const app = Fastify(opts);

    // Core Plugins
    await app.register(helmet);
    await app.register(cors, {
        process.env.CORS_ORIGIN,
        "http://localhost:5173"
        ].filter(Boolean),
    credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
    });

// JWT Setup
// TODO: Add separate secret for production or use a consistent one
await app.register(jwt, {
    secret: process.env.JWT_SECRET || 'supersecret'
});

// Plugins
await app.register(import('@fastify/multipart'), {
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});
await app.register(import('./plugins/db.js'));
await app.register(import('./plugins/auth.js'));

// Routes
await app.register(import('./routes/healthRoutes.js'));
await app.register(import('./routes/authRoutes.js'), { prefix: '/api/auth' });
await app.register(import('./routes/clientRoutes.js'), { prefix: '/api/client' });
await app.register(import('./routes/adminRoutes.js'), { prefix: '/api/admin' });
await app.register(import('./routes/lawyerRoutes.js'), { prefix: '/api/lawyer' });
await app.register(import('./routes/staffRoutes.js'), { prefix: '/api/staff' });
await app.register(import('./routes/auditRoutes.js'), { prefix: '/api/audit' });
await app.register(import('./routes/uploadRoutes.js'), { prefix: '/api/documents' });


// Global Error Handler
app.setErrorHandler((error, request, reply) => {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    request.log.error(error);

    reply.status(statusCode).send({
        message,
        statusCode
    });
});

return app;
};

export default buildApp;
