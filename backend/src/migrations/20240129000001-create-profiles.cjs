'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        const commonFields = {
            user_id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                references: { model: 'users', key: 'id' },
                onDelete: 'CASCADE'
            },
            name: { type: Sequelize.STRING, allowNull: false },
            dob: { type: Sequelize.DATEONLY, allowNull: true },
            gender: { type: Sequelize.ENUM('MALE', 'FEMALE', 'OTHER'), allowNull: true },
            created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        };

        // Client Profile
        await queryInterface.createTable('client_profiles', {
            ...commonFields
        });

        // Staff Profile
        await queryInterface.createTable('staff_profiles', {
            ...commonFields,
            department: { type: Sequelize.STRING, allowNull: true }
        });

        // Admin Profile
        await queryInterface.createTable('admin_profiles', {
            ...commonFields
        });

        // Lawyer Profile
        await queryInterface.createTable('lawyer_profiles', {
            ...commonFields,
            experience_years: { type: Sequelize.INTEGER, defaultValue: 0 },
            rating: { type: Sequelize.FLOAT, defaultValue: 0.0 },
            is_verified: { type: Sequelize.BOOLEAN, defaultValue: false }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('lawyer_profiles');
        await queryInterface.dropTable('admin_profiles');
        await queryInterface.dropTable('staff_profiles');
        await queryInterface.dropTable('client_profiles');
    }
};
