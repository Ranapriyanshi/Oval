'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Venues table
    await queryInterface.createTable('venues', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      state_region: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      country_code: {
        type: Sequelize.STRING(2),
        allowNull: false,
        references: { model: 'countries', key: 'code' },
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true,
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      amenities: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: [],
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'AUD',
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

    await queryInterface.addIndex('venues', ['country_code'], { name: 'idx_venues_country' });
    await queryInterface.addIndex('venues', ['city'], { name: 'idx_venues_city' });
    await queryInterface.addIndex('venues', ['latitude', 'longitude'], { name: 'idx_venues_coords' });

    // Venue sports (sports offered at venue + hourly rate)
    await queryInterface.createTable('venue_sports', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      venue_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'venues', key: 'id' },
        onDelete: 'CASCADE',
      },
      sport_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      hourly_rate_cents: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('venue_sports', ['venue_id'], { name: 'idx_venue_sports_venue' });
    await queryInterface.addIndex('venue_sports', ['venue_id', 'sport_name'], {
      unique: true,
      name: 'venue_sports_venue_sport_unique',
    });

    // Venue images
    await queryInterface.createTable('venue_images', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      venue_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'venues', key: 'id' },
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
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('venue_images', ['venue_id'], { name: 'idx_venue_images_venue' });

    // Venue schedule (recurring weekly hours)
    await queryInterface.createTable('venue_schedules', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      venue_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'venues', key: 'id' },
        onDelete: 'CASCADE',
      },
      day_of_week: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: '0=Sunday, 1=Monday, ... 6=Saturday',
      },
      open_time: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      close_time: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('venue_schedules', ['venue_id'], { name: 'idx_venue_schedules_venue' });

    // Bookings
    await queryInterface.createTable('bookings', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      venue_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'venues', key: 'id' },
        onDelete: 'CASCADE',
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
      start_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      end_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      total_cents: {
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
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'confirmed',
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

    await queryInterface.addIndex('bookings', ['venue_id'], { name: 'idx_bookings_venue' });
    await queryInterface.addIndex('bookings', ['user_id'], { name: 'idx_bookings_user' });
    await queryInterface.addIndex('bookings', ['start_time', 'end_time'], { name: 'idx_bookings_times' });

    // Venue ratings
    await queryInterface.createTable('venue_ratings', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      venue_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'venues', key: 'id' },
        onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('venue_ratings', ['venue_id'], { name: 'idx_venue_ratings_venue' });
    await queryInterface.addIndex('venue_ratings', ['user_id'], { name: 'idx_venue_ratings_user' });
    await queryInterface.addIndex('venue_ratings', ['venue_id', 'user_id'], {
      unique: true,
      name: 'venue_ratings_venue_user_unique',
    });

    // Triggers for updated_at on venues and bookings
    await queryInterface.sequelize.query(`
      CREATE TRIGGER update_venues_updated_at BEFORE UPDATE ON venues
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);
    await queryInterface.sequelize.query(`
      CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;`);
    await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS update_venues_updated_at ON venues;`);

    await queryInterface.dropTable('venue_ratings');
    await queryInterface.dropTable('bookings');
    await queryInterface.dropTable('venue_schedules');
    await queryInterface.dropTable('venue_images');
    await queryInterface.dropTable('venue_sports');
    await queryInterface.dropTable('venues');
  },
};
