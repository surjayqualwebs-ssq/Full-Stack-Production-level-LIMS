import db from '../models/index.js';

const { User, AdminProfile, ClientProfile, LawyerProfile, StaffProfile } = db;

import bcrypt from 'bcrypt';

export const getProfile = async (userId) => {
    return await AdminProfile.findOne({ where: { userId } });
};

export const updateProfile = async (userId, data) => {
    const profile = await AdminProfile.findOne({ where: { userId } });
    if (!profile) throw new Error('Profile not found');

    if (data.name) profile.name = data.name;
    if (data.dob) profile.dob = data.dob;
    if (data.gender) profile.gender = data.gender;

    return await profile.save();
};

export const createInternalUser = async (data) => {
    const { email, password, name, role, ...profileData } = data;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10); // Hardcoded salt rounds for now

    const t = await db.sequelize.transaction();
    try {
        const newUser = await User.create({
            email,
            password_hash: hashedPassword,
            role,
            status: 'ACTIVE' // Internal users active by default?
        }, { transaction: t });

        if (role === 'LAWYER') {
            await LawyerProfile.create({
                userId: newUser.id,
                name,
                ...profileData // experience_years, etc.
            }, { transaction: t });
        } else if (role === 'STAFF') {
            await StaffProfile.create({
                userId: newUser.id,
                name,
                ...profileData // department
            }, { transaction: t });
        } else if (role === 'ADMIN') {
            await AdminProfile.create({
                userId: newUser.id,
                name,
                ...profileData
            }, { transaction: t });
        }

        await t.commit();
        return newUser;
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

export const getAllUsers = async () => {
    // Admin can view all users and their profiles
    const users = await User.findAll({
        attributes: ['id', 'email', 'role', 'status', 'created_at'],
        include: [
            { model: ClientProfile, as: 'clientProfile', attributes: ['name'] },
            { model: LawyerProfile, as: 'lawyerProfile', attributes: ['name'] },
            { model: StaffProfile, as: 'staffProfile', attributes: ['name', 'department'] },
            { model: AdminProfile, as: 'adminProfile', attributes: ['name'] }
        ]
    });

    return users.map(user => {
        const u = user.toJSON();
        let name = 'Unknown';
        let department = null;
        if (u.role === 'CLIENT' && u.clientProfile) name = u.clientProfile.name;
        else if (u.role === 'LAWYER' && u.lawyerProfile) name = u.lawyerProfile.name;
        else if (u.role === 'STAFF' && u.staffProfile) {
            name = u.staffProfile.name;
            department = u.staffProfile.department;
        }
        else if (u.role === 'ADMIN' && u.adminProfile) name = u.adminProfile.name;

        return { ...u, name, department };
    });
};

export const updateAnyUserProfile = async (targetUserId, data) => {
    const user = await User.findByPk(targetUserId);
    if (!user) throw new Error('User not found');

    const t = await db.sequelize.transaction();
    try {
        // Update User table specific fields if present (e.g., status)
        if (data.status) {
            user.status = data.status;
            await user.save({ transaction: t });
        }

        // Update Role Specific Profile
        if (user.role === 'LAWYER') {
            const profile = await LawyerProfile.findOne({ where: { userId: targetUserId } });
            if (profile) await profile.update(data, { transaction: t });
        } else if (user.role === 'STAFF') {
            const profile = await StaffProfile.findOne({ where: { userId: targetUserId } });
            if (profile) await profile.update(data, { transaction: t });
        } else if (user.role === 'ADMIN') {
            const profile = await AdminProfile.findOne({ where: { userId: targetUserId } });
            if (profile) await profile.update(data, { transaction: t });
        } else if (user.role === 'CLIENT') {
            const profile = await ClientProfile.findOne({ where: { userId: targetUserId } });
            if (profile) await profile.update(data, { transaction: t });
        }

        await t.commit();
        return user;
    } catch (error) {
        await t.rollback();
        throw error;
    }
};
