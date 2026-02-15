'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('events', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      organizer_id: {
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
      event_type: {
        type: Sequelize.ENUM('tournament', 'meetup', 'league'),
        allowNull: false,
        defaultValue: 'meetup',
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      venue_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'venues', key: 'id' },
        onDelete: 'SET NULL',
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
      start_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      end_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      max_participants: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 32,
      },
      registration_deadline: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('draft', 'open', 'closed', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'open',
      },
      bracket_type: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'e.g. single_elimination, round_robin',
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
    await queryInterface.addIndex('events', ['organizer_id'], { name: 'idx_events_organizer' });
    await queryInterface.addIndex('events', ['sport_name'], { name: 'idx_events_sport' });
    await queryInterface.addIndex('events', ['status'], { name: 'idx_events_status' });
    await queryInterface.addIndex('events', ['start_time'], { name: 'idx_events_start_time' });

    await queryInterface.createTable('event_registrations', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      event_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'events', key: 'id' },
        onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      status: {
        type: Sequelize.ENUM('registered', 'waitlist', 'cancelled'),
        allowNull: false,
        defaultValue: 'registered',
      },
      registered_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
    await queryInterface.addIndex('event_registrations', ['event_id'], { name: 'idx_event_reg_event' });
    await queryInterface.addIndex('event_registrations', ['user_id'], { name: 'idx_event_reg_user' });
    await queryInterface.addIndex('event_registrations', ['event_id', 'user_id'], {
      unique: true,
      name: 'event_reg_event_user_unique',
    });

    await queryInterface.sequelize.query(`
      CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS update_events_updated_at ON events;');
    await queryInterface.dropTable('event_registrations');
    await queryInterface.dropTable('events');
  },
};
