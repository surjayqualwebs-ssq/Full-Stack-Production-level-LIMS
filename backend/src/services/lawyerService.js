import db from '../models/index.js';

const { LawyerProfile } = db;

export const getProfile = async (userId) => {
    return await LawyerProfile.findOne({ where: { userId } });
};

export const updateProfile = async (userId, data) => {
    const profile = await LawyerProfile.findOne({ where: { userId } });
    if (!profile) throw new Error('Profile not found');

    if (data.name) profile.name = data.name;
    if (data.dob) profile.dob = data.dob;
    if (data.gender) profile.gender = data.gender;
    if (data.experience_years) profile.experience_years = data.experience_years;
    if (data.case_types) profile.case_types = data.case_types;
    if (data.consultation_fee) profile.consultation_fee = data.consultation_fee;
    // Rating, Count, ActiveCases are system managed, not self-updated usually.

    return await profile.save();
};

export const updateCase = async (lawyerId, caseId, data) => {
    const caseRecord = await db.Case.findByPk(caseId);

    if (!caseRecord) throw new Error('Case not found');
    if (caseRecord.lawyer_id !== parseInt(lawyerId)) throw new Error('Case not assigned to you');

    if (!caseRecord) throw new Error('Case not found or not assigned to you');

    if (data.status) caseRecord.status = data.status;
    if (data.next_hearing_date) caseRecord.next_hearing_date = data.next_hearing_date;
    if (data.notes) caseRecord.notes = data.notes; // Allow updating notes too

    return await caseRecord.save();
};
