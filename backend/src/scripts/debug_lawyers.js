
import db from '../models/index.js';

const { User, LawyerProfile } = db;

async function debugLawyers() {
    try {
        const lawyers = await User.findAll({
            where: { role: 'LAWYER' },
            include: [{ model: LawyerProfile, as: 'lawyerProfile' }]
        });

        console.log(`Found ${lawyers.length} lawyers.`);

        lawyers.forEach(l => {
            const p = l.lawyerProfile;
            console.log(`\nLawyer: ${l.email} (Status: ${l.status})`);
            if (p) {
                console.log(`  Name: ${p.name}`);
                console.log(`  Active Cases: ${p.active_case_count}`);
                console.log(`  Case Types:`, p.case_types);
                console.log(`  Type of Case Types: ${typeof p.case_types}`);
                if (Array.isArray(p.case_types)) {
                    console.log(`  Is Array: Yes`);
                } else {
                    console.log(`  Is Array: No (Is String? ${typeof p.case_types === 'string'})`);
                }
            } else {
                console.log('  No Profile Found');
            }
        });

    } catch (error) {
        console.error("Error:", error);
    } finally {
        // await db.sequelize.close(); // Keep connection open or close depending on run
    }
}

debugLawyers();
