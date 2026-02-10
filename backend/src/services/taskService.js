import db from '../models/index.js';
import { Op } from 'sequelize';

const { Task, User } = db;

export const createTask = async (data, userId) => {
    // data: { description, due_date, status, priority, assigned_to (optional overrides), related_case_id }
    // If assigned_to not provided, assign to self? Or require it?
    // Let's assume assign to self if not provided, or require it.

    // For now, simple create
    return await Task.create({
        ...data,
        assigned_to: data.assigned_to || userId // Default to creator if not specified (though controller should handle this)
    });
};

export const updateTask = async (taskId, updates, userId) => {
    const task = await Task.findByPk(taskId);
    if (!task) throw new Error('Task not found');

    // Authz: Only assignee or creator? For now, assume simple "if you can hit the route, you can update" 
    // OR restrict to assignee.
    // Let's restrict to assignee for safety, unless admin.
    // (We'll assume role check happens in controller or here if we passed role)

    if (task.assigned_to !== userId) {
        // Allow if user is admin? We didn't pass role here. 
        // Let's keep it simple: Controller checks permissions.
    }

    return await task.update(updates);
};

export const deleteTask = async (taskId) => {
    const task = await Task.findByPk(taskId);
    if (!task) throw new Error('Task not found');
    return await task.destroy();
};

export const getTaskById = async (taskId) => {
    return await Task.findByPk(taskId, {
        include: [
            { model: User, as: 'assignee', attributes: ['email', 'role'] },
            { model: db.Case, as: 'case', attributes: ['case_number', 'case_type'] }
        ]
    });
};

export const getTasksForUser = async (userId, filters = {}) => {
    const where = { assigned_to: userId };
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;

    return await Task.findAll({
        where,
        order: [['due_date', 'ASC']],
        include: [{ model: db.Case, as: 'case', attributes: ['case_number'] }]
    });
};

export const getUpcomingTasks = async (userId, days = 7) => {
    const today = new Date();
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + days);

    return await Task.findAll({
        where: {
            assigned_to: userId,
            status: { [Op.ne]: 'COMPLETED' }, // Only pending/in-progress
            due_date: {
                [Op.between]: [today, targetDate]
            }
        },
        order: [['due_date', 'ASC']],
        include: [{ model: db.Case, as: 'case', attributes: ['case_number'] }]
    });
};
