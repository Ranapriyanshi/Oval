'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('ovalo_profiles', 'equipped_badge', {
      type: Sequelize.STRING(64),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('ovalo_profiles', 'equipped_badge');
  },
};
