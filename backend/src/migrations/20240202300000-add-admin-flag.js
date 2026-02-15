'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'is_admin', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addIndex('users', ['is_admin'], { name: 'idx_users_is_admin' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'is_admin');
  },
};
