'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add avatar_choice column
    await queryInterface.addColumn('users', 'avatar_choice', {
      type: Sequelize.ENUM('boy', 'girl'),
      allowNull: true,
      comment: 'User-selected avatar character preference',
    });

    // Add mobile column
    await queryInterface.addColumn('users', 'mobile', {
      type: Sequelize.STRING(20),
      allowNull: true,
      comment: 'User mobile phone number',
    });

    // Add index on mobile for potential lookups
    await queryInterface.addIndex('users', ['mobile'], {
      name: 'idx_users_mobile',
      where: {
        mobile: {
          [Sequelize.Op.ne]: null,
        },
      },
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove index
    await queryInterface.removeIndex('users', 'idx_users_mobile');

    // Remove columns
    await queryInterface.removeColumn('users', 'mobile');
    await queryInterface.removeColumn('users', 'avatar_choice');

    // Drop the ENUM type (PostgreSQL specific)
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_users_avatar_choice";
    `);
  },
};
