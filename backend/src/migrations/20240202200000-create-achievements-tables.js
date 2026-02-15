'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('achievements', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      key: {
        type: Sequelize.STRING(80),
        allowNull: false,
        unique: true,
      },
      name: {
        type: Sequelize.STRING(120),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      icon: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'emoji or icon name',
      },
      criteria_type: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'e.g. matches_played, karma, events_joined',
      },
      criteria_value: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
    await queryInterface.addIndex('achievements', ['key'], { name: 'idx_achievements_key' });

    await queryInterface.createTable('user_achievements', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      achievement_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'achievements', key: 'id' },
        onDelete: 'CASCADE',
      },
      progress: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      unlocked_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
    await queryInterface.addIndex('user_achievements', ['user_id'], { name: 'idx_user_achievements_user' });
    await queryInterface.addIndex('user_achievements', ['achievement_id'], { name: 'idx_user_achievements_achievement' });
    await queryInterface.addIndex('user_achievements', ['user_id', 'achievement_id'], {
      unique: true,
      name: 'user_achievements_user_achievement_unique',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_achievements');
    await queryInterface.dropTable('achievements');
  },
};
