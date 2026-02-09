import db from '../models/index.js';

const { Intake, Case, LawyerProfile, User } = db;

import { randomUUID } from 'crypto';

const processDocuments = (newDocs, existingDocs = []) => {
    if (!newDocs || !Array.isArray(newDocs)) return existingDocs; // No changes if no new docs passed

    // Clone existing docs to avoid mutation issues
    const processedDocs = JSON.parse(JSON.stringify(existingDocs));

    newDocs.forEach(newDoc => {
        // newDoc expected: { name: "...", url: "..." }

        const existingIndex = processedDocs.findIndex(d => d.name === newDoc.name);

        if (existingIndex > -1) {
            // Document exists, add new version
            const currentDoc = processedDocs[existingIndex];
            const nextVersion = currentDoc.versions.length + 1;

            currentDoc.versions.push({
                version: nextVersion,
                url: newDoc.url,
                uploaded_at: new Date().toISOString(),
                // uploader_id could be added if we pass userId to this func
            });
        } else {
            // New Document
            processedDocs.push({
                file_id: randomUUID(),
                name: newDoc.name,
                versions: [{
                    version: 1,
                    url: newDoc.url,
                    uploaded_at: new Date().toISOString()
                }]
            });
        }
    });

    return processedDocs;
};

export const createIntake = async (userId, data) => {
    // Transform initial documents to versioned structure
    const versionedDocs = processDocuments(data.documents, []);

    // Round-Robin / Load Balancing Assignment
    // 1. Find all Active Staff
    const activeStaff = await User.findAll({
        where: { role: 'STAFF', status: 'ACTIVE' },
        attributes: ['id']
    });

    let assignedStaffId = null;

    if (activeStaff.length > 0) {
        // 2. Find Load for each staff (Count PENDING intakes)
        // Optimization: Could be a single GROUP BY query, but loop is fine for small staff numbers
        const staffLoads = await Promise.all(activeStaff.map(async (staff) => {
            const count = await Intake.count({
                where: { assigned_staff_id: staff.id, status: 'PENDING' }
            });
            return { id: staff.id, count };
        }));

        // 3. Sort by Load ASC
        staffLoads.sort((a, b) => a.count - b.count);
        assignedStaffId = staffLoads[0].id;
    }

    return await Intake.create({
        client_id: userId,
        assigned_staff_id: assignedStaffId,
        case_type: data.caseType,
        details: JSON.stringify(data.details),
        documents: versionedDocs,
        status: 'PENDING'
    });
};

export const getMyIntakes = async (userId) => {
    const intakes = await Intake.findAll({
        where: { client_id: userId },
        order: [['created_at', 'DESC']]
    });
    return intakes.map(i => {
        const plain = i.get({ plain: true });
        try { plain.details = JSON.parse(plain.details); } catch (e) { }
        return plain;
    });
};

export const getIntakeById = async (userId, intakeId) => {
    const intake = await Intake.findOne({
        where: { id: intakeId, client_id: userId }
    });
    if (!intake) return null;
    const plain = intake.get({ plain: true });
    try { plain.details = JSON.parse(plain.details); } catch (e) { }
    return plain;
};

export const updateIntake = async (userId, intakeId, data) => {
    const intake = await Intake.findOne({ where: { id: intakeId, client_id: userId } });

    if (!intake) throw new Error('Intake not found');

    if (intake.status === 'PERM_REJECTED') {
        throw new Error('This intake has been permanently rejected. Please contact support.');
    }

    if (intake.status === 'TEMP_REJECTED' || intake.status === 'CLARIFICATION_NEEDED') {
        // Resubmission Logic
        if (data.details) intake.details = JSON.stringify(data.details);

        // Handle document updates
        if (data.documents && Array.isArray(data.documents)) {
            intake.documents = processDocuments(data.documents, intake.documents);
        }

        intake.attempts += 1;
        intake.status = 'PENDING';
        intake.documents_verified = false; // Reset verification
        intake.rejection_reason = null; // Clear reason

        return await intake.save();
    } else {
        throw new Error('Cannot update intake in current status');
    }
};

export const getMyCases = async (userId) => {
    return await Case.findAll({
        where: { client_id: userId },
        include: [
            {
                model: User,
                as: 'lawyer',
                attributes: ['email'],
                include: [{
                    model: LawyerProfile,
                    as: 'lawyerProfile',
                    attributes: ['name', 'rating', 'experience_years']
                }]
            }
        ],
        order: [['created_at', 'DESC']]
    });
};

export const rateLawyer = async (userId, caseId, rating, review) => {
    const t = await db.sequelize.transaction();

    try {
        const caseRecord = await Case.findOne({
            where: { id: caseId, client_id: userId },
            transaction: t
        });

        if (!caseRecord) throw new Error('Case not found');
        if (caseRecord.status !== 'CLOSED') throw new Error('Case must be CLOSED to rate the lawyer');
        if (caseRecord.client_rating) throw new Error('You have already rated this case');

        // 1. Update Case
        caseRecord.client_rating = rating;
        caseRecord.client_review = review;
        await caseRecord.save({ transaction: t });

        // 2. Update Lawyer Profile Stats
        if (caseRecord.lawyer_id) {
            const lawyerProfile = await LawyerProfile.findOne({
                where: { userId: caseRecord.lawyer_id },
                transaction: t
            });

            if (lawyerProfile) {
                // Calculate new average
                // Previous Total Score = old_rating * old_count (Handle nulls: 0 * 0)
                const currentRating = parseFloat(lawyerProfile.rating) || 0;
                const currentCount = lawyerProfile.rating_count || 0;

                const newCount = currentCount + 1;
                const newTotalRating = (currentRating * currentCount) + rating;
                const newAverage = newTotalRating / newCount;

                lawyerProfile.rating_count = newCount;
                lawyerProfile.rating = parseFloat(newAverage.toFixed(2)); // Keep 2 decimals

                await lawyerProfile.save({ transaction: t });
            }
        }

        await t.commit();
        return caseRecord;

    } catch (error) {
        await t.rollback();
        throw error;
    }
};
