'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('users', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            password_hash: {
                type: Sequelize.STRING,
                allowNull: false
            },
            role: {
                type: Sequelize.ENUM('ADMIN', 'CLIENT', 'STAFF', 'LAWYER'),
                allowNull: false,
                defaultValue: 'CLIENT'
            },
            status: {
                type: Sequelize.ENUM('ACTIVE', 'INACTIVE', 'BANNED', 'PENDING'),
                allowNull: false,
                defaultValue: 'ACTIVE'
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('users');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_role";');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_status";');
    }
};
