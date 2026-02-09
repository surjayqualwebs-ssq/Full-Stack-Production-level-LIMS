'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('cases', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            intake_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                unique: true,
                references: { model: 'intakes', key: 'id' },
                onDelete: 'RESTRICT'
            },
            client_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'users', key: 'id' }
            },
            lawyer_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: { model: 'users', key: 'id' }
            },
            case_number: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            status: {
                type: Sequelize.ENUM('OPEN', 'IN_PROGRESS', 'ON_HOLD', 'CLOSED'),
                defaultValue: 'OPEN'
            },
            start_date: {
                type: Sequelize.DATEONLY,
                defaultValue: Sequelize.literal('CURRENT_DATE')
            },
            notes: {
                type: Sequelize.TEXT,
                allowNull: true
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

        await queryInterface.addIndex('cases', ['lawyer_id']);
        await queryInterface.addIndex('cases', ['status']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('cases');
    }
};
