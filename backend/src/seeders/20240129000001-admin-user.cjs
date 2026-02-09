'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('admin123', salt);

        // 1. Create Admin User
        const [adminId] = await queryInterface.bulkInsert('users', [{
            email: 'admin@lims.com',
            password_hash: passwordHash,
            role: 'ADMIN',
            status: 'ACTIVE',
            created_at: new Date(),
            updated_at: new Date()
        }], { returning: ['id'] });

        // Note: bulkInsert with returning only works on Postgres. 
        // If it fails, we fetch the user by email.
        let userId = adminId;
        if (typeof adminId === 'object' && adminId.id) {
            userId = adminId.id;
        } else if (!adminId) {
            const users = await queryInterface.sequelize.query(
                `SELECT id FROM users WHERE email = 'admin@lims.com';`,
                { type: queryInterface.sequelize.QueryTypes.SELECT }
            );
            userId = users[0].id;
        }

        // 2. Create Admin Profile
        await queryInterface.bulkInsert('admin_profiles', [{
            user_id: userId,
            name: 'Super Admin',
            dob: '1990-01-01',
            gender: 'MALE',
            created_at: new Date(),
            updated_at: new Date()
        }]);
    },

    async down(queryInterface, Sequelize) {
        // Cascade delete on User should handle profile, but being safe:
        await queryInterface.bulkDelete('users', { email: 'admin@lims.com' }, {});
    }
};
