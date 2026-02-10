import db from '../models/index.js';
import * as clientService from '../services/clientService.js';
import { NotFoundError, ConflictError, AuthorizationError } from '../errors/index.js';
import ApiError from '../errors/ApiError.js';
import * as auditService from '../services/auditService.js';

const { ClientProfile } = db;

export const updateProfile = async (req, reply) => {
    const userId = req.user.id;
    const { dob, gender } = req.body;

    if (!dob && !gender) {
        throw new ApiError(400, 'No fields to update');
    }

    const profile = await ClientProfile.findOne({ where: { userId } });
    if (!profile) {
        throw new NotFoundError('Profile not found');
    }

    if (dob) profile.dob = dob;
    if (gender) profile.gender = gender;

    await profile.save();

    // Audit
    await auditService.logAction({
        userId,
        action: 'UPDATE_PROFILE',
        entityType: 'USER',
        entityId: userId,
        details: { updates: { dob, gender } },
        ipAddress: req.ip
    });

    return reply.send({
        message: 'Profile updated successfully',
        profile
    });
};

export const getProfile = async (req, reply) => {
    const userId = req.user.id;
    const profile = await ClientProfile.findOne({ where: { userId } });

    if (!profile) {
        throw new NotFoundError('Profile not found');
    }

    return reply.send(profile);
};

export const submitIntake = async (req, reply) => {
    const userId = req.user.id;
    const { caseType, details } = req.body;

    if (!caseType || !details) {
        throw new ApiError(400, 'Case Type and Details are required');
    }

    const intake = await clientService.createIntake(userId, req.body);

    // Audit
    await auditService.logAction({
        userId,
        action: 'INTAKE_SUBMITTED',
        entityType: 'INTAKE',
        entityId: intake.id,
        details: { caseType },
        ipAddress: req.ip
    });

    return reply.code(201).send(intake);
};

export const getMyIntakes = async (req, reply) => {
    const userId = req.user.id;
    const intakes = await clientService.getMyIntakes(userId);
    return reply.send(intakes);
};

export const getIntakeById = async (req, reply) => {
    const { id } = req.params;
    const userId = req.user.id;
    const intake = await clientService.getIntakeById(userId, id);

    if (!intake) throw new NotFoundError('Intake not found');

    return reply.send(intake);
};

export const updateIntake = async (req, reply) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const intake = await clientService.updateIntake(userId, id, req.body);

        // Audit Resubmission
        await auditService.logAction({
            userId,
            action: 'INTAKE_RESUBMITTED',
            entityType: 'INTAKE',
            entityId: intake.id,
            ipAddress: req.ip
        });

        return reply.send(intake);
    } catch (error) {
        // Map service errors to Custom Errors if needed, or better, make service throw Custom Errors
        if (error.message.includes('not found')) throw new NotFoundError(error.message);
        if (error.message.includes('permanently rejected')) throw new ForbiddenError(error.message);
        if (error.message.includes('Cannot update')) throw new ApiError(400, error.message);
        throw error;
    }
};

export const getMyCases = async (req, reply) => {
    const userId = req.user.id;
    const cases = await clientService.getMyCases(userId);
    return reply.send(cases);
};

export const rateLawyer = async (req, reply) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { rating, review } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            throw new ApiError(400, 'Valid rating (1-5) is required');
        }

        const updatedCase = await clientService.rateLawyer(userId, id, rating, review);

        // Audit
        await auditService.logAction({
            userId,
            action: 'LAWYER_RATED',
            entityType: 'CASE',
            entityId: id,
            details: { rating, lawyerId: updatedCase.lawyer_id },
            ipAddress: req.ip
        });

        return reply.send({ message: 'Rating submitted successfully', case: updatedCase });
    } catch (error) {
        if (error.message.includes('CLOSED')) throw new ApiError(400, error.message);
        if (error.message.includes('already rated')) throw new ApiError(400, error.message);
        if (error.message.includes('not found')) throw new NotFoundError(error.message);
        throw error;
    }
};
