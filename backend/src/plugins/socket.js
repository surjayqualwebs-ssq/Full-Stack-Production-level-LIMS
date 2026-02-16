
import fp from 'fastify-plugin';
import { Server } from 'socket.io';

export default fp(async (fastify, opts) => {
  // 1. Initialize Socket.io
  const io = new Server(fastify.server, {
    cors: {
      origin: process.env.CORS_ORIGIN, // Strict for production
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // 2. Auth Middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      // Verify JWT using Fastify's JWT plugin decorator
      // Note: fastify.jwt is usually available if registered before this plugin
      // If we are outside request context, we might need to verify manually if fastify.jwt isn't exposed properly,
      // but usually `fastify.jwt` is the instance.
      try {
        const decoded = await fastify.jwt.verify(token);
        socket.data.user = decoded;
        next();
      } catch (jwtErr) {
        fastify.log.error(jwtErr);
        return next(new Error('Authentication error: Invalid token'));
      }
    } catch (err) {
      fastify.log.error(err);
      return next(new Error('Authentication error'));
    }
  });

  // 3. Connection Handler
  io.on('connection', (socket) => {
    const user = socket.data.user;
    if (user) {
      fastify.log.info(`Socket User connected: ${user.id} (${user.role})`);

      // Join Rooms based on Role
      if (user.role === 'admin') {
        socket.join('admin-dashboard');
        fastify.log.info(`User ${user.id} joined admin-dashboard`);
      } else if (user.role === 'staff') {
        socket.join('staff-dashboard');
        fastify.log.info(`User ${user.id} joined staff-dashboard`);
      } else if (user.role === 'lawyer') {
        socket.join('lawyer-dashboard');
        socket.join(`lawyer-${user.id}`);
        fastify.log.info(`User ${user.id} joined lawyer-dashboard & lawyer-${user.id}`);
      } else if (user.role === 'client') {
        socket.join(`client-${user.id}`);
        fastify.log.info(`User ${user.id} joined client-${user.id}`);
      }
    }

    socket.on('disconnect', () => {
      fastify.log.info(`Socket User disconnected: ${user?.id}`);
    });
  });

  // 4. Decorate Fastify Instance
  fastify.decorate('io', io);

  // Cleanup on close
  fastify.addHook('onClose', (instance, done) => {
    io.close();
    done();
  });
});
