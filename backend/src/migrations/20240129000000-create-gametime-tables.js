'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Gametime events table
    await queryInterface.createTable('gametimes', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      creator_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      sport_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      event_type: {
        type: Sequelize.ENUM('casual', 'competitive', 'training'),
        allowNull: false,
        defaultValue: 'casual',
      },
      skill_level: {
        type: Sequelize.ENUM('beginner', 'intermediate', 'advanced', 'any'),
        allowNull: false,
        defaultValue: 'any',
      },
      venue_name: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      address: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      country: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true,
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true,
      },
      start_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      end_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      max_players: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 10,
      },
      current_players: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      cost_per_person_cents: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'AUD',
      },
      status: {
        type: Sequelize.ENUM('upcoming', 'in_progress', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'upcoming',
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
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

    await queryInterface.addIndex('gametimes', ['creator_id'], { name: 'idx_gametimes_creator' });
    await queryInterface.addIndex('gametimes', ['sport_name'], { name: 'idx_gametimes_sport' });
    await queryInterface.addIndex('gametimes', ['city'], { name: 'idx_gametimes_city' });
    await queryInterface.addIndex('gametimes', ['status'], { name: 'idx_gametimes_status' });
    await queryInterface.addIndex('gametimes', ['start_time'], { name: 'idx_gametimes_start_time' });

    // Gametime participants table
    await queryInterface.createTable('gametime_participants', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      gametime_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'gametimes', key: 'id' },
        onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      status: {
        type: Sequelize.ENUM('joined', 'left', 'removed'),
        allowNull: false,
        defaultValue: 'joined',
      },
      joined_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('gametime_participants', ['gametime_id'], {
      name: 'idx_gametime_participants_gametime',
    });
    await queryInterface.addIndex('gametime_participants', ['user_id'], {
      name: 'idx_gametime_participants_user',
    });
    await queryInterface.addIndex('gametime_participants', ['gametime_id', 'user_id'], {
      unique: true,
      name: 'gametime_participants_gametime_user_unique',
    });

    // Auto-update trigger for gametimes.updated_at
    await queryInterface.sequelize.query(`
      CREATE TRIGGER update_gametimes_updated_at BEFORE UPDATE ON gametimes
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS update_gametimes_updated_at ON gametimes;
    `);
    await queryInterface.dropTable('gametime_participants');
    await queryInterface.dropTable('gametimes');
  },
};
