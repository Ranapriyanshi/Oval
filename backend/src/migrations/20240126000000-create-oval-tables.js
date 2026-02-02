'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create countries table
    await queryInterface.createTable('countries', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      code: {
        type: Sequelize.STRING(2),
        allowNull: false,
        unique: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
      },
      timezone: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Insert default countries
    await queryInterface.bulkInsert('countries', [
      {
        code: 'AU',
        name: 'Australia',
        currency: 'AUD',
        timezone: 'Australia/Sydney',
        created_at: new Date(),
      },
      {
        code: 'US',
        name: 'United States',
        currency: 'USD',
        timezone: 'America/New_York',
        created_at: new Date(),
      },
    ], {
      ignoreDuplicates: true,
    });

    // Create users table
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      country: {
        type: Sequelize.STRING(2),
        allowNull: false,
        defaultValue: 'AU',
        references: {
          model: 'countries',
          key: 'code',
        },
      },
      timezone: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'Australia/Sydney',
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'AUD',
      },
      sports_preferences: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        defaultValue: [],
      },
      karma_points: {
        type: Sequelize.INTEGER,
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

    // Create indexes
    await queryInterface.addIndex('users', ['email'], { name: 'idx_users_email' });
    await queryInterface.addIndex('users', ['country'], { name: 'idx_users_country' });

    // Create sports_by_region table
    await queryInterface.createTable('sports_by_region', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      country_code: {
        type: Sequelize.STRING(2),
        allowNull: false,
        references: {
          model: 'countries',
          key: 'code',
        },
      },
      sport_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      is_popular: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add unique constraint
    await queryInterface.addIndex('sports_by_region', ['country_code', 'sport_name'], {
      unique: true,
      name: 'sports_by_region_country_sport_unique',
    });

    // Insert popular sports for Australia
    await queryInterface.bulkInsert('sports_by_region', [
      { country_code: 'AU', sport_name: 'AFL', is_popular: true, created_at: new Date() },
      { country_code: 'AU', sport_name: 'Cricket', is_popular: true, created_at: new Date() },
      { country_code: 'AU', sport_name: 'Rugby', is_popular: true, created_at: new Date() },
      { country_code: 'AU', sport_name: 'Netball', is_popular: true, created_at: new Date() },
      { country_code: 'AU', sport_name: 'Tennis', is_popular: true, created_at: new Date() },
      { country_code: 'AU', sport_name: 'Basketball', is_popular: true, created_at: new Date() },
      { country_code: 'AU', sport_name: 'Football', is_popular: true, created_at: new Date() },
      { country_code: 'AU', sport_name: 'Badminton', is_popular: true, created_at: new Date() },
    ], {
      ignoreDuplicates: true,
    });

    // Insert popular sports for United States
    await queryInterface.bulkInsert('sports_by_region', [
      { country_code: 'US', sport_name: 'Basketball', is_popular: true, created_at: new Date() },
      { country_code: 'US', sport_name: 'Football', is_popular: true, created_at: new Date() },
      { country_code: 'US', sport_name: 'Baseball', is_popular: true, created_at: new Date() },
      { country_code: 'US', sport_name: 'Tennis', is_popular: true, created_at: new Date() },
      { country_code: 'US', sport_name: 'Soccer', is_popular: true, created_at: new Date() },
      { country_code: 'US', sport_name: 'Volleyball', is_popular: true, created_at: new Date() },
      { country_code: 'US', sport_name: 'Badminton', is_popular: true, created_at: new Date() },
    ], {
      ignoreDuplicates: true,
    });

    // Create function to update updated_at timestamp
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create trigger for users table
    await queryInterface.sequelize.query(`
      CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);
  },

  async down(queryInterface, Sequelize) {
    // Drop trigger and function
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
    `);
    await queryInterface.sequelize.query(`
      DROP FUNCTION IF EXISTS update_updated_at_column();
    `);

    // Drop tables in reverse order
    await queryInterface.dropTable('sports_by_region');
    await queryInterface.dropTable('users');
    await queryInterface.dropTable('countries');
  },
};
