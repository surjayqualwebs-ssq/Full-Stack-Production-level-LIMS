import * as auditService from '../services/auditService.js';

export const getLogs = async (req, reply) => {
    const userId = req.user.id;
    const userRole = req.user.role;

    // RBAC Logic
    // If Admin, fetch all logs (potentially paginated)
    // If Not Admin, fetch only logs where user_id === userId

    let logs;
    if (userRole === 'ADMIN') {
        logs = await auditService.getAllLogs();
    } else {
        logs = await auditService.getUserLogs(userId);
    }

    return reply.send(logs);
};
