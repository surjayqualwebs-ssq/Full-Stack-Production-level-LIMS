import db from '../models/index.js';
import * as caseService from './caseService.js';

const { StaffProfile } = db;

export const getProfile = async (userId) => {
    return await StaffProfile.findOne({ where: { userId } });
};

export const updateProfile = async (userId, data) => {
    const profile = await StaffProfile.findOne({ where: { userId } });
    if (!profile) throw new Error('Profile not found');

    if (data.name) profile.name = data.name;
    if (data.dob) profile.dob = data.dob;
    if (data.gender) profile.gender = data.gender;
    if (data.department) profile.department = data.department;

    return await profile.save();
};

export const getPendingIntakes = async (staffId) => {
    const whereClause = { status: 'PENDING' };
    if (staffId) {
        // Show intakes assigned to this staff OR unassigned intakes (pool)
        whereClause[db.Sequelize.Op.or] = [
            { assigned_staff_id: staffId },
            { assigned_staff_id: null }
        ];
    }

    const intakes = await db.Intake.findAll({
        where: whereClause,
        include: [{
            model: db.User,
            as: 'client',
            attributes: ['email'],
            include: [{ model: db.ClientProfile, as: 'clientProfile', attributes: ['name'] }]
        }]
    });

    return intakes.map(i => {
        const plain = i.get({ plain: true });
        try { plain.details = JSON.parse(plain.details); } catch (e) { }
        return plain;
    });
};

export const getIntakeById = async (id) => {
    const intake = await db.Intake.findByPk(id, {
        include: [{ model: db.User, as: 'client', attributes: ['email'] }]
    });
    if (!intake) return null;
    const plain = intake.get({ plain: true });
    try { plain.details = JSON.parse(plain.details); } catch (e) { }
    return plain;
};

export const verifyIntake = async (id, staffId) => {
    const intake = await db.Intake.findByPk(id);
    if (!intake) throw new Error('Intake not found');

    // Logic: Verification is a step before Approval
    intake.documents_verified = true;
    // intake.status = 'PENDING'; // Ensure it stays pending if we want to be explicit, or just leave it.

    return await intake.save();
};

export const approveIntake = async (id) => {
    const intake = await db.Intake.findByPk(id);
    if (!intake) throw new Error('Intake not found');

    intake.status = 'APPROVED';
    await intake.save(); // Save first

    // Trigger Case Creation
    await caseService.generateCase(intake);

    return intake;
};

export const rejectIntake = async (id, reason) => {
    const intake = await db.Intake.findByPk(id);
    if (!intake) throw new Error('Intake not found');

    // Check previous rejections for this case type?
    // Using simple logic: Update status and reason
    intake.status = 'REJECTED';
    intake.rejection_reason = reason;
    return await intake.save();
};

export const updateProceduralStatus = async (id, status) => {
    // Defines procedural updates, e.g., specifically generic status updates (if allowed)
    const intake = await db.Intake.findByPk(id);
    if (!intake) throw new Error('Intake not found');
    intake.status = status;
    return await intake.save();
};

export const addInternalNote = async (id, note) => {
    const intake = await db.Intake.findByPk(id);
    if (!intake) throw new Error('Intake not found');

    // Append or Overwrite? Appending is safer for history
    const prevNotes = intake.internal_notes ? intake.internal_notes + '\n' : '';
    intake.internal_notes = `${prevNotes}[${new Date().toISOString()}] ${note}`;
    return await intake.save();
};
