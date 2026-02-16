import * as staffService from '../services/staffService.js';
import * as auditService from '../services/auditService.js';
import { NotFoundError, ApiError } from '../errors/index.js';

export const getProfile = async (req, reply) => {
    const userId = req.user.id;
    const profile = await staffService.getProfile(userId);
    if (!profile) throw new NotFoundError('Profile not found');
    return reply.send(profile);
};

export const updateProfile = async (req, reply) => {
    const userId = req.user.id;
    const profile = await staffService.updateProfile(userId, req.body);

    // Audit
    await auditService.logAction({
        userId,
        action: 'UPDATE_PROFILE',
        entityType: 'USER',
        entityId: userId,
        details: { updates: req.body }, // Be careful not to log sensitive info if any
        ipAddress: req.ip
    });

    return reply.send({ message: 'Profile updated', profile });
};

export const getPendingIntakes = async (req, reply) => {
    const intakes = await staffService.getPendingIntakes(req.user.id);
    return reply.send(intakes);
};

export const reviewIntake = async (req, reply) => {
    const { id } = req.params;
    const { action, reason, note, status } = req.body;
    const staffId = req.user.id;

    let result;
    switch (action) {
        case 'VERIFY_DOCS':
            result = await staffService.verifyIntake(id);
            break;
        case 'APPROVE':
            result = await staffService.approveIntake(id, req.server.io);
            break;
        case 'REJECT':
            if (!reason) throw new ApiError(400, 'Rejection reason is required');
            result = await staffService.rejectIntake(id, reason);
            break;
        case 'UPDATE_STATUS':
            if (!status) throw new ApiError(400, 'Status is required');
            result = await staffService.updateProceduralStatus(id, status);
            break;
        case 'ADD_NOTE':
            if (!note) throw new ApiError(400, 'Note is required');
            result = await staffService.addInternalNote(id, note);
            break;
        default:
            throw new ApiError(400, 'Invalid action');
    }

    // Audit the action
    await auditService.logAction({
        userId: staffId,
        action: `STAFF_${action}`, // e.g., STAFF_APPROVE
        entityType: 'INTAKE',
        entityId: id,
        details: { reason, note, status },
        ipAddress: req.ip
    });

    // Notify Client
    // Ensure result has user_id/userId/client_id to target the correct room
    if (result && (result.user_id || result.userId || result.client_id)) {
        const clientUserId = result.user_id || result.userId || result.client_id;
        req.server.io.to(`client-${clientUserId}`).emit('intake:updated', result);
    }
    // Notify Admin/Staff dashboards
    req.server.io.to('admin-dashboard').to('staff-dashboard').emit('dashboard:intake-updated', result);

    return reply.send(result);
};
