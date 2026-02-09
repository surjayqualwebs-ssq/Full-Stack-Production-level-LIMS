
import db from '../models/index.js';

const { Intake, Case } = db;

async function checkOrphanedIntakes() {
    try {
        const intakes = await Intake.findAll({
            where: { status: 'APPROVED' }
        });

        // Step 32 showed Intake.js:
        // static associate(models) {
        //     Intake.belongsTo(models.User, { foreignKey: 'client_id', as: 'client' });
        //     // Will associate with Case later
        // }
        // So Intake.include(Case) won't work unless Case belongsTo Intake (which it does) and we query Case.

        console.log(`Checking APPROVED intakes...`);
        for (const intake of intakes) {
            const caseRecord = await Case.findOne({ where: { intake_id: intake.id } });
            console.log(`Intake #${intake.id} (Type: ${intake.case_type}): Case ID = ${caseRecord ? caseRecord.id : 'NONE'}`);
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        // process.exit();
    }
}

checkOrphanedIntakes();
