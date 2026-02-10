import * as lawyerService from '../services/lawyerService.js';
import * as caseService from '../services/caseService.js';
import { NotFoundError } from '../errors/index.js';
import * as auditService from '../services/auditService.js';

export const getProfile = async (req, reply) => {
    const userId = req.user.id;
    const profile = await lawyerService.getProfile(userId);
    if (!profile) throw new NotFoundError('Profile not found');
    return reply.send(profile);
};

export const updateProfile = async (req, reply) => {
    const userId = req.user.id;
    // Don't allow rating update by lawyer themselves?
    const { rating, ...safeData } = req.body;

    const profile = await lawyerService.updateProfile(userId, safeData);

    // Audit
    await auditService.logAction({
        userId,
        action: 'UPDATE_PROFILE',
        entityType: 'USER',
        entityId: userId,
        details: { updates: safeData },
        ipAddress: req.ip
    });

    return reply.send({ message: 'Profile updated', profile });
};

export const getMyCases = async (req, reply) => {
    const userId = req.user.id;
    const cases = await caseService.getCasesForLawyer(userId);
    return reply.send(cases);
};

export const updateCaseDetails = async (req, reply) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { status, next_hearing_date, notes } = req.body;

    const updatedCase = await lawyerService.updateCase(userId, id, { status, next_hearing_date, notes });

    await auditService.logAction({
        userId,
        action: 'UPDATE_CASE_DETAILS',
        entityType: 'CASE',
        entityId: id,
        details: { status, next_hearing_date, notes },
        ipAddress: req.ip
    });

    return reply.send(updatedCase);
};

// --- New Features ---

export const getUpcomingHearings = async (req, reply) => {
    const userId = req.user.id;
    const { days } = req.query;
    const hearings = await caseService.getUpcomingHearings(userId, 'LAWYER', days ? parseInt(days) : 7);
    return reply.send(hearings);
};

export const updateCaseStatus = async (req, reply) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { status } = req.body;

    // Explicit status transition logic
    const updatedCase = await caseService.updateCaseStatus(id, status, userId, 'LAWYER');

    await auditService.logAction({
        userId,
        action: 'UPDATE_CASE_STATUS',
        entityType: 'CASE',
        entityId: id,
        details: { status },
        ipAddress: req.ip
    });

    return reply.send(updatedCase);
};

import * as taskService from '../services/taskService.js';

export const getTasks = async (req, reply) => {
    const userId = req.user.id;
    const tasks = await taskService.getTasksForUser(userId, req.query);
    return reply.send(tasks);
};

export const getUpcomingTasks = async (req, reply) => {
    const userId = req.user.id;
    const { days } = req.query;
    const tasks = await taskService.getUpcomingTasks(userId, days ? parseInt(days) : 7);
    return reply.send(tasks);
};

export const createTask = async (req, reply) => {
    const userId = req.user.id;
    const task = await taskService.createTask(req.body, userId);

    await auditService.logAction({
        userId,
        action: 'CREATE_TASK',
        entityType: 'TASK',
        entityId: task.id,
        details: { title: task.title },
        ipAddress: req.ip
    });

    return reply.send(task);
};

export const updateTask = async (req, reply) => {
    const userId = req.user.id;
    const { id } = req.params;
    const task = await taskService.updateTask(id, req.body, userId);

    await auditService.logAction({
        userId,
        action: 'UPDATE_TASK',
        entityType: 'TASK',
        entityId: id,
        details: { updates: req.body },
        ipAddress: req.ip
    });

    return reply.send(task);
};

export const deleteTask = async (req, reply) => {
    const { id } = req.params;
    await taskService.deleteTask(id);

    await auditService.logAction({
        userId: req.user.id,
        action: 'DELETE_TASK',
        entityType: 'TASK',
        entityId: id,
        ipAddress: req.ip
    });

    return reply.send({ message: 'Task deleted' });
};
