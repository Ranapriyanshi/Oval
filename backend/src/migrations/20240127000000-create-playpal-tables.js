'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // User sports skills (skill level per sport)
    await queryInterface.createTable('user_sports_skills', {
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
      sport_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      skill_level: {
        type: Sequelize.ENUM('beginner', 'intermediate', 'advanced', 'professional'),
        allowNull: false,
        defaultValue: 'intermediate',
      },
      years_experience: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      play_style: {
        type: Sequelize.ENUM('casual', 'competitive', 'recreational', 'training'),
        allowNull: false,
        defaultValue: 'casual',
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

    await queryInterface.addIndex('user_sports_skills', ['user_id'], { name: 'idx_user_sports_skills_user' });
    await queryInterface.addIndex('user_sports_skills', ['user_id', 'sport_name'], {
      unique: true,
      name: 'user_sports_skills_user_sport_unique',
    });

    // User availability schedule (when user is available to play)
    await queryInterface.createTable('user_availability', {
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
      day_of_week: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: '0=Sunday, 1=Monday, ... 6=Saturday',
      },
      start_time: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      end_time: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('user_availability', ['user_id'], { name: 'idx_user_availability_user' });

    // User profile photos
    await queryInterface.createTable('user_profile_photos', {
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
      url: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      sort_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      is_primary: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('user_profile_photos', ['user_id'], { name: 'idx_user_profile_photos_user' });

    // User location (for location-based matching)
    await queryInterface.addColumn('users', 'latitude', {
      type: Sequelize.DECIMAL(10, 8),
      allowNull: true,
    });
    await queryInterface.addColumn('users', 'longitude', {
      type: Sequelize.DECIMAL(11, 8),
      allowNull: true,
    });
    await queryInterface.addColumn('users', 'city', {
      type: Sequelize.STRING(100),
      allowNull: true,
    });
    await queryInterface.addColumn('users', 'bio', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    // User swipes (left = pass, right = like)
    await queryInterface.createTable('user_swipes', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      swiper_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        comment: 'User who performed the swipe',
      },
      swiped_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        comment: 'User who was swiped on',
      },
      direction: {
        type: Sequelize.ENUM('left', 'right'),
        allowNull: false,
        comment: 'left = pass, right = like',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('user_swipes', ['swiper_id'], { name: 'idx_user_swipes_swiper' });
    await queryInterface.addIndex('user_swipes', ['swiped_id'], { name: 'idx_user_swipes_swiped' });
    await queryInterface.addIndex('user_swipes', ['swiper_id', 'swiped_id'], {
      unique: true,
      name: 'user_swipes_swiper_swiped_unique',
    });

    // User matches (when both users swipe right on each other)
    await queryInterface.createTable('user_matches', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      user1_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      user2_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      matched_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'false if unmatched',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('user_matches', ['user1_id'], { name: 'idx_user_matches_user1' });
    await queryInterface.addIndex('user_matches', ['user2_id'], { name: 'idx_user_matches_user2' });
    await queryInterface.addIndex('user_matches', ['user1_id', 'user2_id'], {
      unique: true,
      name: 'user_matches_users_unique',
    });

    // Trigger for updated_at on user_sports_skills
    await queryInterface.sequelize.query(`
      CREATE TRIGGER update_user_sports_skills_updated_at BEFORE UPDATE ON user_sports_skills
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS update_user_sports_skills_updated_at ON user_sports_skills;
    `);

    await queryInterface.dropTable('user_matches');
    await queryInterface.dropTable('user_swipes');
    await queryInterface.dropTable('user_profile_photos');
    await queryInterface.dropTable('user_availability');
    await queryInterface.dropTable('user_sports_skills');

    await queryInterface.removeColumn('users', 'bio');
    await queryInterface.removeColumn('users', 'city');
    await queryInterface.removeColumn('users', 'longitude');
    await queryInterface.removeColumn('users', 'latitude');
  },
};
