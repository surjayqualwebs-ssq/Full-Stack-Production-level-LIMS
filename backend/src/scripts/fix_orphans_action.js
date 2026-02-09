
import db from '../models/index.js';
import * as caseService from '../services/caseService.js';

const { Intake, Case } = db;

async function fixOrphans() {
    try {
        const intakes = await Intake.findAll({
            where: { status: 'APPROVED' }
        });

        console.log(`Checking ${intakes.length} approved intakes for orphans...`);

        for (const intake of intakes) {
            const caseRecord = await Case.findOne({ where: { intake_id: intake.id } });

            if (!caseRecord) {
                console.log(`Fixing orphan Intake #${intake.id}...`);
                try {
                    const newCase = await caseService.generateCase(intake);
                    console.log(`  Success! Created Case: ${newCase.case_number} (Status: ${newCase.status})`);
                } catch (err) {
                    console.error(`  Failed to generate case for Intake #${intake.id}:`, err.message);
                }
            }
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        // process.exit();
    }
}

fixOrphans();
