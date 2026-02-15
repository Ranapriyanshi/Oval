'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // User stats per sport (matches_played, wins, losses, hours, etc.)
    await queryInterface.createTable('user_stats', {
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
      sport: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      matches_played: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      wins: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      losses: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      draws: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      hours_played: {
        type: Sequelize.DECIMAL(6, 2),
        allowNull: false,
        defaultValue: 0,
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
    await queryInterface.addIndex('user_stats', ['user_id'], { name: 'idx_user_stats_user' });
    await queryInterface.addIndex('user_stats', ['sport'], { name: 'idx_user_stats_sport' });
    await queryInterface.addIndex('user_stats', ['user_id', 'sport'], {
      unique: true,
      name: 'user_stats_user_sport_unique',
    });

    // Game history: one row per user per completed game (links to gametime)
    await queryInterface.createTable('game_history', {
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
      sport: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      played_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
    await queryInterface.addIndex('game_history', ['gametime_id'], { name: 'idx_game_history_gametime' });
    await queryInterface.addIndex('game_history', ['user_id'], { name: 'idx_game_history_user' });
    await queryInterface.addIndex('game_history', ['user_id', 'sport'], { name: 'idx_game_history_user_sport' });

    // Player ratings: post-game rating of another player (rating + sportsmanship)
    await queryInterface.createTable('player_ratings', {
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
      rater_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      rated_user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: '1-5 skill/performance',
      },
      sportsmanship: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: '1-5 sportsmanship',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
    await queryInterface.addIndex('player_ratings', ['gametime_id'], { name: 'idx_player_ratings_gametime' });
    await queryInterface.addIndex('player_ratings', ['rated_user_id'], { name: 'idx_player_ratings_rated' });
    await queryInterface.addIndex('player_ratings', ['rater_id', 'gametime_id', 'rated_user_id'], {
      unique: true,
      name: 'player_ratings_rater_game_rated_unique',
    });

    // Trigger for user_stats.updated_at (reuse existing function)
    await queryInterface.sequelize.query(`
      CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS update_user_stats_updated_at ON user_stats;
    `);
    await queryInterface.dropTable('player_ratings');
    await queryInterface.dropTable('game_history');
    await queryInterface.dropTable('user_stats');
  },
};
