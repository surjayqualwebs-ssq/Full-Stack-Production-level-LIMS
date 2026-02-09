
import db from '../models/index.js';

const { Case, User, ClientProfile, LawyerProfile } = db;

async function checkCases() {
    try {
        const cases = await Case.findAll({
            include: [
                { model: User, as: 'lawyer', include: [{ model: LawyerProfile, as: 'lawyerProfile' }] },
                { model: User, as: 'client', include: [{ model: ClientProfile, as: 'clientProfile' }] }
            ]
        });

        console.log(`Found ${cases.length} cases.`);
        cases.forEach(c => {
            console.log(`\nCase: ${c.case_number} (ID: ${c.id})`);
            console.log(`  Status: ${c.status}`);
            console.log(`  Type: ${c.case_type}`);
            console.log(`  Client: ${c.client?.clientProfile?.name || c.client?.email}`);
            console.log(`  Lawyer: ${c.lawyer?.lawyerProfile?.name || 'Unassigned'} (ID: ${c.lawyer_id})`);
        });

    } catch (error) {
        console.error("Error:", error);
    } finally {
        // process.exit();
    }
}

checkCases();
