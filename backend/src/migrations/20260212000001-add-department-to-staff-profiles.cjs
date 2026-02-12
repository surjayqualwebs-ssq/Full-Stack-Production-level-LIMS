'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        const tableInfo = await queryInterface.describeTable('staff_profiles');
        if (!tableInfo.department) {
            await queryInterface.addColumn('staff_profiles', 'department', {
                type: Sequelize.STRING,
                allowNull: true
            });
        }
    },

    async down(queryInterface, Sequelize) {
        const tableInfo = await queryInterface.describeTable('staff_profiles');
        if (tableInfo.department) {
            await queryInterface.removeColumn('staff_profiles', 'department');
        }
    }
};
