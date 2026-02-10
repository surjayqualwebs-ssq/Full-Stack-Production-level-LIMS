import db from '../models/index.js';
import { Op } from 'sequelize';

const { Case, LawyerProfile, User } = db;

export const generateCase = async (intake) => {
    const t = await db.sequelize.transaction();

    try {
        // 1. Generate Case Number
        // 1. Generate Case Number
        const year = new Date().getFullYear();
        // Use timestamp to ensure uniqueness instead of count which can conflict if rows are deleted
        const suffix = Date.now().toString().slice(-6);
        const caseNumber = `CAS-${year}-${suffix}`;

        // 2. Find Suitable Lawyer
        let selectedLawyerId = null;

        // Fetch all active lawyers
        // Note: In production, optimize this query to filter at SQL level
        const lawyers = await User.findAll({
            where: { role: 'LAWYER', status: 'ACTIVE' },
            include: [{ model: LawyerProfile, as: 'lawyerProfile' }],
            transaction: t
        });

        // Filter and Sort
        const candidates = lawyers.filter(user => {
            const profile = user.lawyerProfile;
            if (!profile) return false;

            // Checks
            const hasRoom = profile.active_case_count < 5;
            // Check if case_type array exists and includes the intake type
            // Assuming case_types is stored as ["CIVIL", "CRIMINAL"] in JSONB
            const handlesType = profile.case_types && profile.case_types.includes(intake.case_type);

            return hasRoom && handlesType;
        }).sort((a, b) => {
            // Sort by active_case_count ASC (Load Balancing)
            return a.lawyerProfile.active_case_count - b.lawyerProfile.active_case_count;
        });

        if (candidates.length > 0) {
            selectedLawyerId = candidates[0].id;
        }

        // 3. Create Case
        const newCase = await Case.create({
            intake_id: intake.id,
            client_id: intake.client_id,
            lawyer_id: selectedLawyerId, // Nullable
            case_number: caseNumber,
            status: selectedLawyerId ? 'OPEN' : 'QUEUED', // Status depends on assignment
            case_type: intake.case_type, // Ensure case_type is stored in Case model too? Assuming Intake has it, but good to have. 
            // WAIT: Case model might not have case_type column based on generateCase usage. 
            // If Case table lacks case_type, we rely on intake.case_type or add it.
            // Let's assume for now we use intake association or add it. 
            // In step 225 grep showed "case_type" in Intake.
            // Let's stick to existing schema if possible, BUT for queueing we need to query by Case Type efficiently.
            // The user asked for "4 different queues".
            // If Case doesn't have case_type, we have to Query Cases include Intake where Intake.case_type = ...
            // That's fine.
            notes: `Auto-generated from Intake #${intake.id}`
        }, { transaction: t });

        // 4. Update Lawyer Stats
        if (selectedLawyerId) {
            const lawyerProfile = candidates[0].lawyerProfile;
            lawyerProfile.active_case_count += 1;
            await lawyerProfile.save({ transaction: t });
        }

        await t.commit();
        return newCase;
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

export const processQueueForLawyer = async (lawyerId) => {
    const t = await db.sequelize.transaction();
    try {
        // 1. Get Lawyer Profile
        const lawyer = await User.findByPk(lawyerId, {
            include: [{ model: LawyerProfile, as: 'lawyerProfile' }],
            transaction: t
        });

        if (!lawyer || !lawyer.lawyerProfile) return;

        const profile = lawyer.lawyerProfile;

        // 2. Check Capacity
        if (profile.active_case_count >= 5) {
            await t.commit();
            return;
        }

        // 3. Get Specialization
        const specializations = profile.case_types || []; // e.g. ['CIVIL']
        if (specializations.length === 0) {
            await t.commit();
            return;
        }

        // 4. Find Oldest Queued Case matching Specialization (FCFS)
        // We need to join Intake to filter by case_type if Case doesn't have it.
        const queuedCase = await Case.findOne({
            where: { status: 'QUEUED' },
            include: [{
                model: db.Intake,
                as: 'intake',
                where: { case_type: { [Op.in]: specializations } }
            }],
            order: [['created_at', 'ASC']],
            transaction: t,
            lock: true, // Prevent race conditions
            skipLocked: true // Skip if another process is handling it
        });

        if (queuedCase) {
            // 5. Assign
            queuedCase.lawyer_id = lawyerId;
            queuedCase.status = 'OPEN';
            await queuedCase.save({ transaction: t });

            // 6. Update Stats
            profile.active_case_count += 1;
            await profile.save({ transaction: t });
        }

        await t.commit();
    } catch (error) {
        await t.rollback();
        console.error('Queue Processing Error:', error);
    }
};

export const getCasesForLawyer = async (lawyerId) => {
    return await Case.findAll({
        where: { lawyer_id: lawyerId },
        include: [{
            model: db.User,
            as: 'client',
            attributes: ['email'],
            include: [{ model: db.ClientProfile, as: 'clientProfile', attributes: ['name'] }]
        }]
    });
};

export const getAllCases = async () => {
    return await Case.findAll({
        include: [
            {
                model: db.User,
                as: 'client',
                attributes: ['email'],
                include: [{ model: db.ClientProfile, as: 'clientProfile', attributes: ['name'] }]
            },
            {
                model: db.User,
                as: 'lawyer',
                attributes: ['email'],
                include: [{ model: db.LawyerProfile, as: 'lawyerProfile', attributes: ['name'] }]
            }
        ]
    });
};

export const getUpcomingHearings = async (userId, role, days = 7) => {
    const today = new Date();
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + days);

    const whereClause = {
        next_hearing_date: {
            [Op.between]: [today, targetDate]
        }
    };

    if (role === 'LAWYER') {
        whereClause.lawyer_id = userId;
    } else if (role === 'CLIENT') {
        whereClause.client_id = userId;
    }

    return await Case.findAll({
        where: whereClause,
        order: [['next_hearing_date', 'ASC']],
        include: [
            {
                model: db.User,
                as: 'client',
                attributes: ['email'],
                include: [{ model: db.ClientProfile, as: 'clientProfile', attributes: ['name'] }]
            },
            {
                model: db.User,
                as: 'lawyer',
                attributes: ['email'],
                include: [{ model: db.LawyerProfile, as: 'lawyerProfile', attributes: ['name'] }]
            }
        ]
    });
};

export const updateCaseStatus = async (caseId, newStatus, userId, userRole) => {
    const caseRecord = await Case.findByPk(caseId);
    if (!caseRecord) throw new Error('Case not found');

    if (userRole === 'LAWYER' && caseRecord.lawyer_id !== userId) {
        throw new Error('Unauthorized: You are not the assigned lawyer');
    }
    if (userRole === 'CLIENT') {
        throw new Error('Unauthorized: Clients cannot change case status');
    }

    const validTransitions = {
        'QUEUED': ['OPEN', 'CLOSED'],
        'OPEN': ['IN_PROGRESS', 'ON_HOLD', 'CLOSED'],
        'IN_PROGRESS': ['ON_HOLD', 'CLOSED', 'OPEN'],
        'ON_HOLD': ['IN_PROGRESS', 'CLOSED', 'OPEN'],
        'CLOSED': ['OPEN']
    };

    const currentStatus = caseRecord.status;
    if (currentStatus !== newStatus) {
        const allowed = validTransitions[currentStatus] || [];
        if (!allowed.includes(newStatus) && userRole !== 'ADMIN') {
            throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
        }
    }

    caseRecord.status = newStatus;
    return await caseRecord.save();
};
