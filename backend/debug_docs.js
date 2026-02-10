
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
        // service is in src/services
        // so __dirname (of service) is root/backend/src/services
        // uploadDir is ../../uploads -> root/backend/uploads
        // Here __dirname is root/backend
        // so uploadDir is ./uploads
        const uploadDir = path.join(__dirname, 'uploads');

        console.log("Upload Dir:", uploadDir);

        const docs = await db.Document.findAll({ include: ['versions'] });
        console.log(`Found ${docs.length} documents.`);

        for (const doc of docs) {
            console.log(`\nDocument ID: ${doc.id} Name: ${doc.name}`);
            if (doc.versions && doc.versions.length > 0) {
                const latest = doc.versions[doc.versions.length - 1];
                console.log(`  Latest Version ID: ${latest.id}`);
                console.log(`  File Path (DB): ${latest.file_path}`);

                const fullPath = path.join(uploadDir, latest.file_path);
                console.log(`  Full Path: ${fullPath}`);

                if (fs.existsSync(fullPath)) {
                    console.log(`  [OK] File exists.`);
                } else {
                    console.error(`  [FAIL] File NOT found!`);
                }
            } else {
                console.log("  No versions found.");
            }
        }

        await db.sequelize.close();

    } catch (e) {
        console.error(e);
    }
};

run();
