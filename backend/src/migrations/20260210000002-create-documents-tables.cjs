'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // Create Documents Table
        await queryInterface.createTable('documents', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            entity_type: {
                type: Sequelize.ENUM('INTAKE', 'CASE', 'USER'),
                allowNull: true
            },
            entity_id: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            uploader_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        // Create DocumentVersions Table
        await queryInterface.createTable('document_versions', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            document_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'documents',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            version_number: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 1
            },
            file_path: {
                type: Sequelize.STRING,
                allowNull: false
            },
            original_name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            mime_type: {
                type: Sequelize.STRING,
                allowNull: false
            },
            size: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('document_versions');
        await queryInterface.dropTable('documents');
    }
};
