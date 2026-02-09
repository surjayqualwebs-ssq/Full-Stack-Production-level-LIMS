'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('intakes', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            client_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'users', key: 'id' },
                onDelete: 'CASCADE'
            },
            case_type: {
                type: Sequelize.ENUM('CIVIL', 'CORPORATE', 'CRIMINAL', 'MATRIMONIAL'),
                allowNull: false
            },
            details: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            documents: {
                type: Sequelize.JSONB,
                defaultValue: []
            },
            status: {
                type: Sequelize.ENUM('PENDING', 'VERIFIED', 'APPROVED', 'REJECTED', 'CLARIFICATION_NEEDED'),
                defaultValue: 'PENDING'
            },
            attempts: {
                type: Sequelize.INTEGER,
                defaultValue: 1
            },
            internal_notes: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            rejection_reason: {
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

        // Indexes for frequent queries by status
        await queryInterface.addIndex('intakes', ['status']);
        await queryInterface.addIndex('intakes', ['client_id']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('intakes');
    }
};
