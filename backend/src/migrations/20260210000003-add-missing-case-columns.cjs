'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('cases', 'case_type', {
            type: Sequelize.ENUM('CIVIL', 'CRIMINAL', 'CORPORATE', 'MATRIMONIAL', 'FAMILY', 'PROPERTY'),
            allowNull: false,
            defaultValue: 'CIVIL'
        });
        await queryInterface.addColumn('cases', 'next_hearing_date', {
            type: Sequelize.DATEONLY,
            allowNull: true
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('cases', 'next_hearing_date');
        await queryInterface.removeColumn('cases', 'case_type');
    }
};
