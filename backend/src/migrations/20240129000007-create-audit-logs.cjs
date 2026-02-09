'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('audit_logs', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: { model: 'users', key: 'id' },
                onDelete: 'SET NULL'
            },
            action: {
                type: Sequelize.STRING,
                allowNull: false
            },
            entity_type: {
                type: Sequelize.STRING,
                allowNull: true
            },
            entity_id: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            details: {
                type: Sequelize.JSONB,
                allowNull: true
            },
            ip_address: {
                type: Sequelize.STRING,
                allowNull: true
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        await queryInterface.addIndex('audit_logs', ['user_id']);
        await queryInterface.addIndex('audit_logs', ['created_at']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('audit_logs');
    }
};
