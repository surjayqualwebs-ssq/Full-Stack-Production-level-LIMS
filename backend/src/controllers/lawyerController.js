import * as lawyerService from '../services/lawyerService.js';
import * as caseService from '../services/caseService.js';
import { NotFoundError } from '../errors/index.js';

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
    return reply.send(updatedCase);
};
