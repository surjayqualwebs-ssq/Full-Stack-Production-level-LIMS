import db from '../models/index.js';

const { AuditLog } = db;

/**
 * Logs a system action.
 * Fire and forget style (doesn't block main flow usually, but we await it for safety in this context).
 * @param {Object} params
 * @param {number} params.userId - Who performed the action (optional)
 * @param {string} params.action - Action name (e.g., 'LOGIN', 'CREATE_INTAKE')
 * @param {string} params.entityType - 'USER', 'INTAKE', 'CASE' (optional)
 * @param {number} params.entityId - ID of entity (optional)
 * @param {Object} params.details - JSON details (optional)
 * @param {string} params.ipAddress - Request IP (optional)
 */
export const logAction = async ({ userId, action, entityType, entityId, details, ipAddress }) => {
    try {
        await AuditLog.create({
            user_id: userId || null,
            action,
            entity_type: entityType || null,
            entity_id: entityId || null,
            details: details || null,
            ip_address: ipAddress || null
        });
    } catch (error) {
        console.error('Audit Logging Failed:', error);
        // Do not throw, so we don't break the main request flow
    }
};

export const getAllLogs = async () => {
    return await AuditLog.findAll({
        order: [['created_at', 'DESC']],
        limit: 100 // Cap for performance
    });
};

export const getUserLogs = async (userId) => {
    return await AuditLog.findAll({
        where: { user_id: userId },
        order: [['created_at', 'DESC']],
        limit: 50
    });
};
