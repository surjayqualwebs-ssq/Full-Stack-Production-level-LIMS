import db from '../models/index.js';

const sync = async () => {
    try {
        console.log('Authenticating...');
        await db.sequelize.authenticate();
        console.log('Syncing database with { alter: true }...');
        await db.sequelize.sync({ alter: true });
        console.log('Database synced successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Sync failed:', error);
        process.exit(1);
    }
};

sync();
