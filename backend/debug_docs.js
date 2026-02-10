
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Override DB_HOST for local execution BEFORE importing db
process.env.DB_HOST = 'localhost';

const run = async () => {
    try {
        const db = (await import('./src/models/index.js')).default;

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const uploadDir = path.join(__dirname, 'uploads');

        console.log("Upload Dir:", uploadDir);

        const docs = await db.Document.findAll({ include: ['versions'] });
        console.log(`Found ${docs.length} documents in DB.`);

        for (const doc of docs) {
            console.log(`\nDocument ID: ${doc.id} Name: ${doc.name}`);
            if (doc.versions && doc.versions.length > 0) {
                const latest = doc.versions[doc.versions.length - 1];
                console.log(`  Latest Version ID: ${latest.id}`);
                console.log(`  File Path (DB): ${latest.file_path}`);

                const fullPath = path.join(uploadDir, latest.file_path);

                if (fs.existsSync(fullPath)) {
                    console.log(`  [OK] File exists.`);
                } else {
                    console.error(`  [FAIL] File NOT found at ${fullPath}`);
                }
            } else {
                console.log("  No versions found.");
            }
        }

        console.log("\n--- Checking Intake 1 ---");
        try {
            const intake = await db.Intake.findByPk(1);
            if (intake) {
                console.log("Intake 1 found.");
                // documents is JSONB, so it should be an object/array already
                console.log("Documents JSON:", JSON.stringify(intake.documents, null, 2));

                if (Array.isArray(intake.documents)) {
                    for (const doc of intake.documents) {
                        console.log(`Checking Doc ID: ${doc.id} (URL: ${doc.url})`);
                        if (doc.id) {
                            // Verify if this doc ID exists in DB
                            const dbDoc = await db.Document.findByPk(doc.id);
                            console.log(`  -> Exists in DB? ${!!dbDoc}`);
                        } else {
                            console.log("  -> No ID in JSON object");
                        }
                    }
                }
            } else {
                console.log("Intake 1 NOT found.");
            }
        } catch (err) {
            console.error("Error checking intake:", err);
        }

        await db.sequelize.close();

    } catch (e) {
        console.error(e);
    }
};

run();
