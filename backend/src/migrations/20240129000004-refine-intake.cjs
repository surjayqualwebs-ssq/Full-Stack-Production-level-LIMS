'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // Add documents_verified column
        await queryInterface.addColumn('intakes', 'documents_verified', {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        });

        // Update ENUM for status (PostgreSQL specific approach)
        // We need to add new values to the enum type "enum_intakes_status"
        try {
            await queryInterface.sequelize.query(`ALTER TYPE "enum_intakes_status" ADD VALUE 'TEMP_REJECTED';`);
            await queryInterface.sequelize.query(`ALTER TYPE "enum_intakes_status" ADD VALUE 'PERM_REJECTED';`);
        } catch (e) {
            // Ignore if already exists (idempotency check wrapper could be better but this suffices for dev)
            console.log('Enum values might already exist');
        }
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('intakes', 'documents_verified');
        // Cannot easily remove ENUM values in Postgres without dropping type
    }
};
