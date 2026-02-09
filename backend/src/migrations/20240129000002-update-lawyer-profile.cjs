'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('lawyer_profiles', 'rating_count', {
            type: Sequelize.INTEGER,
            defaultValue: 0
        });
        await queryInterface.addColumn('lawyer_profiles', 'case_types', {
            type: Sequelize.JSONB,
            defaultValue: []
        });
        await queryInterface.addColumn('lawyer_profiles', 'active_case_count', {
            type: Sequelize.INTEGER,
            defaultValue: 0
        });
        await queryInterface.addColumn('lawyer_profiles', 'consultation_fee', {
            type: Sequelize.INTEGER,
            defaultValue: 500
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('lawyer_profiles', 'rating_count');
        await queryInterface.removeColumn('lawyer_profiles', 'case_types');
        await queryInterface.removeColumn('lawyer_profiles', 'active_case_count');
        await queryInterface.removeColumn('lawyer_profiles', 'consultation_fee');
    }
};
