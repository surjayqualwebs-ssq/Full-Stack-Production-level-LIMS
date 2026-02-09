
import db from '../models/index.js';
import * as caseService from '../services/caseService.js';

const { User, LawyerProfile } = db;

async function fixLawyers() {
    try {
        const lawyers = await User.findAll({
            where: { role: 'LAWYER' },
            include: [{ model: LawyerProfile, as: 'lawyerProfile' }]
        });

        const allTypes = ['CIVIL', 'CRIMINAL', 'CORPORATE', 'MATRIMONIAL', 'FAMILY', 'PROPERTY'];

        for (const lawyer of lawyers) {
            if (lawyer.lawyerProfile) {
                console.log(`Updating lawyer: ${lawyer.email}`);
                lawyer.lawyerProfile.case_types = allTypes;
                await lawyer.lawyerProfile.save();
                console.log(`  Updated case_types to:`, allTypes);

                console.log(`  Processing queue for lawyer...`);
                await caseService.processQueueForLawyer(lawyer.id);
                console.log(`  Queue processed.`);
            }
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        // process.exit(); // Let it finish naturally
    }
}

fixLawyers();
