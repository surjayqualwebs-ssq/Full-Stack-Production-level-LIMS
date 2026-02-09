'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('cases', 'client_rating', {
            type: Sequelize.INTEGER,
            allowNull: true,
            validate: { min: 1, max: 5 }
        });
        await queryInterface.addColumn('cases', 'client_review', {
            type: Sequelize.TEXT,
            allowNull: true
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('cases', 'client_rating');
        await queryInterface.removeColumn('cases', 'client_review');
    }
};
