import dotenv from 'dotenv';
import { getSecret } from './utils/secrets.js';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

dotenv.config();

const start = async () => {
    console.log('--- DEBUG: Starting Server ---');

    // AWS Secret Name - Change this to match what you create in AWS
    const SECRET_NAME = "LIMS-With-DevOps";

    // 1. Fetch Secrets
    if (process.env.NODE_ENV === 'production') {
        console.log('Fetching secrets from AWS Secrets Manager...');
        const secrets = await getSecret(SECRET_NAME);

        if (secrets) {
            console.log('Secrets fetched successfully.');
            // Inject into process.env
            Object.keys(secrets).forEach(key => {
                process.env[key] = secrets[key];
            });

            console.log('--- DEBUG: Secrets Keys Loaded:', Object.keys(secrets));
            console.log('--- DEBUG: DB_PASSWORD type:', typeof process.env.DB_PASSWORD);

            // Run Migrations (now that we have the password)
            try {
                console.log('Running database migrations...');
                // Explicitly pass process.env to the child process
                const { stdout, stderr } = await execAsync('npx sequelize-cli db:migrate', { env: process.env });
                console.log('Migrations stdout:', stdout);
                if (stderr) console.log('Migrations stderr:', stderr);

            } catch (error) {
                console.error('Migration failed:', error);
                // Fail hard if migrations fail
                process.exit(1);
            }

            // Run Seeds (separately, so if they fail due to duplicates, we don't crash)
            try {
                console.log('Running database seeds...');
                const { stdout: seedStdout, stderr: seedStderr } = await execAsync('npx sequelize-cli db:seed:all', { env: process.env });
                console.log('Seeds stdout:', seedStdout);
                if (seedStderr) console.log('Seeds stderr:', seedStderr);
            } catch (error) {
                console.warn('Seeding failed (likely duplicate data), continuing startup:', error.message);
                // Do NOT exit, just continue
            }
        } else {
            console.warn('Could not fetch secrets, falling back to environment variables.');
        }
    } else {
        console.log('Development mode: Using local .env');
    }

    console.log('DB_HOST:', process.env.DB_HOST);
    // console.log('DB_USER:', process.env.DB_USER); // Don't log sensitive info in prod
    console.log('DB_NAME:', process.env.DB_NAME);
    console.log('------------------------------');

    // 2. Dynamic Import of App (Must happen AFTER process.env is populated)
    const buildApp = (await import('./app.js')).default;

    const app = await buildApp({
        logger: {
            level: process.env.LOG_LEVEL || 'info'
        }
    });

    try {
        const port = process.env.PORT || 3000;
        const host = process.env.HOST || '0.0.0.0';

        await app.listen({ port, host });
        // Logger will handle output
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();
