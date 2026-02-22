'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create enum for tiers
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_ovalo_profiles_tier" AS ENUM (
        'rookie_nest',
        'community_flyer',
        'court_commander',
        'elite_wing',
        'legend_of_the_oval'
      );
    `);

    await queryInterface.createTable('ovalo_profiles', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      total_xp: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      tier: {
        type: '"enum_ovalo_profiles_tier"',
        allowNull: false,
        defaultValue: 'rookie_nest',
      },
      current_streak: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      longest_streak: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      last_active_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      feather_level: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      unlocked_embellishments: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: '[]',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('ovalo_profiles', ['user_id'], {
      unique: true,
      name: 'idx_ovalo_profiles_user',
    });
    await queryInterface.addIndex('ovalo_profiles', ['tier'], {
      name: 'idx_ovalo_profiles_tier',
    });
    await queryInterface.addIndex('ovalo_profiles', ['total_xp'], {
      name: 'idx_ovalo_profiles_xp',
    });

    // Create enum for XP sources
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_xp_transactions_source" AS ENUM (
        'booking_completed',
        'gametime_attended',
        'gametime_hosted',
        'streak_bonus',
        'new_sport',
        'friend_invited',
        'tournament_won',
        'training_session',
        'player_rated',
        'match_won',
        'event_joined',
        'coaching_completed'
      );
    `);

    await queryInterface.createTable('xp_transactions', {
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
      amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      source: {
        type: '"enum_xp_transactions_source"',
        allowNull: false,
      },
      reference_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('xp_transactions', ['user_id'], {
      name: 'idx_xp_transactions_user',
    });
    await queryInterface.addIndex('xp_transactions', ['source'], {
      name: 'idx_xp_transactions_source',
    });
    await queryInterface.addIndex('xp_transactions', ['created_at'], {
      name: 'idx_xp_transactions_date',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('xp_transactions');
    await queryInterface.dropTable('ovalo_profiles');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_xp_transactions_source";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_ovalo_profiles_tier";');
  },
};
