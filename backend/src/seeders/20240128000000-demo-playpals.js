'use strict';

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const uuidv4 = () => crypto.randomUUID();

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const passwordHash = await bcrypt.hash('password123', 10);

    // Create demo playpal users
    const user1 = uuidv4();
    const user2 = uuidv4();
    const user3 = uuidv4();
    const user4 = uuidv4();
    const user5 = uuidv4();
    const user6 = uuidv4();

    await queryInterface.bulkInsert('users', [
      {
        id: user1,
        email: 'alex.tennis@demo.oval',
        password_hash: passwordHash,
        name: 'Alex Chen',
        country: 'AU',
        timezone: 'Australia/Sydney',
        currency: 'AUD',
        karma_points: 42,
        latitude: -33.8688,
        longitude: 151.2093,
        city: 'Sydney',
        bio: 'Weekend tennis warrior. Looking for doubles partners and friendly rallies around the Eastern Suburbs.',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: user2,
        email: 'priya.multi@demo.oval',
        password_hash: passwordHash,
        name: 'Priya Sharma',
        country: 'AU',
        timezone: 'Australia/Sydney',
        currency: 'AUD',
        karma_points: 85,
        latitude: -33.8523,
        longitude: 151.2108,
        city: 'Sydney',
        bio: 'Competitive badminton player turned casual all-rounder. Love trying new sports and meeting active people!',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: user3,
        email: 'james.runner@demo.oval',
        password_hash: passwordHash,
        name: 'James O\'Brien',
        country: 'AU',
        timezone: 'Australia/Melbourne',
        currency: 'AUD',
        karma_points: 23,
        latitude: -37.8136,
        longitude: 144.9631,
        city: 'Melbourne',
        bio: 'Marathon runner & social soccer player. Early mornings or late arvo sessions work best for me.',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: user4,
        email: 'sarah.swimmer@demo.oval',
        password_hash: passwordHash,
        name: 'Sarah Kim',
        country: 'AU',
        timezone: 'Australia/Sydney',
        currency: 'AUD',
        karma_points: 67,
        latitude: -33.8915,
        longitude: 151.2767,
        city: 'Sydney',
        bio: 'Former competitive swimmer, now into open water & beach volleyball. Always up for a surf too!',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: user5,
        email: 'marco.basketball@demo.oval',
        password_hash: passwordHash,
        name: 'Marco Rossi',
        country: 'US',
        timezone: 'America/New_York',
        currency: 'USD',
        karma_points: 31,
        latitude: 40.7128,
        longitude: -74.0060,
        city: 'New York',
        bio: 'Basketball and gym regular. Looking for pickup game buddies in Manhattan/Brooklyn.',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: user6,
        email: 'emma.yoga@demo.oval',
        password_hash: passwordHash,
        name: 'Emma Wilson',
        country: 'AU',
        timezone: 'Australia/Sydney',
        currency: 'AUD',
        karma_points: 54,
        latitude: -33.8561,
        longitude: 151.2153,
        city: 'Sydney',
        bio: 'Yoga instructor who also loves a good hit of tennis and cycling along the harbour.',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // Sports skills
    await queryInterface.bulkInsert('user_sports_skills', [
      // Alex - Tennis focused
      { id: uuidv4(), user_id: user1, sport_name: 'Tennis', skill_level: 'advanced', years_experience: 8, play_style: 'competitive', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), user_id: user1, sport_name: 'Basketball', skill_level: 'intermediate', years_experience: 3, play_style: 'casual', created_at: new Date(), updated_at: new Date() },

      // Priya - Multi-sport
      { id: uuidv4(), user_id: user2, sport_name: 'Badminton', skill_level: 'advanced', years_experience: 10, play_style: 'competitive', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), user_id: user2, sport_name: 'Tennis', skill_level: 'intermediate', years_experience: 2, play_style: 'casual', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), user_id: user2, sport_name: 'Swimming', skill_level: 'beginner', years_experience: 1, play_style: 'recreational', created_at: new Date(), updated_at: new Date() },

      // James - Running + Soccer
      { id: uuidv4(), user_id: user3, sport_name: 'Running', skill_level: 'professional', years_experience: 12, play_style: 'competitive', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), user_id: user3, sport_name: 'Soccer', skill_level: 'intermediate', years_experience: 5, play_style: 'casual', created_at: new Date(), updated_at: new Date() },

      // Sarah - Water sports + Beach volleyball
      { id: uuidv4(), user_id: user4, sport_name: 'Swimming', skill_level: 'advanced', years_experience: 15, play_style: 'competitive', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), user_id: user4, sport_name: 'Volleyball', skill_level: 'intermediate', years_experience: 3, play_style: 'casual', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), user_id: user4, sport_name: 'Surfing', skill_level: 'beginner', years_experience: 1, play_style: 'recreational', created_at: new Date(), updated_at: new Date() },

      // Marco - Basketball + Gym
      { id: uuidv4(), user_id: user5, sport_name: 'Basketball', skill_level: 'advanced', years_experience: 10, play_style: 'competitive', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), user_id: user5, sport_name: 'Gym', skill_level: 'intermediate', years_experience: 4, play_style: 'training', created_at: new Date(), updated_at: new Date() },

      // Emma - Yoga + Tennis + Cycling
      { id: uuidv4(), user_id: user6, sport_name: 'Yoga', skill_level: 'professional', years_experience: 8, play_style: 'training', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), user_id: user6, sport_name: 'Tennis', skill_level: 'beginner', years_experience: 1, play_style: 'recreational', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), user_id: user6, sport_name: 'Cycling', skill_level: 'intermediate', years_experience: 3, play_style: 'casual', created_at: new Date(), updated_at: new Date() },
    ]);

    // Availability schedules
    await queryInterface.bulkInsert('user_availability', [
      // Alex - Weekday evenings + Saturday morning
      { id: uuidv4(), user_id: user1, day_of_week: 1, start_time: '18:00', end_time: '20:00', created_at: new Date() },
      { id: uuidv4(), user_id: user1, day_of_week: 3, start_time: '18:00', end_time: '20:00', created_at: new Date() },
      { id: uuidv4(), user_id: user1, day_of_week: 6, start_time: '08:00', end_time: '12:00', created_at: new Date() },

      // Priya - Tue/Thu evenings + weekends
      { id: uuidv4(), user_id: user2, day_of_week: 2, start_time: '17:30', end_time: '19:30', created_at: new Date() },
      { id: uuidv4(), user_id: user2, day_of_week: 4, start_time: '17:30', end_time: '19:30', created_at: new Date() },
      { id: uuidv4(), user_id: user2, day_of_week: 0, start_time: '09:00', end_time: '13:00', created_at: new Date() },
      { id: uuidv4(), user_id: user2, day_of_week: 6, start_time: '09:00', end_time: '14:00', created_at: new Date() },

      // James - Early mornings + Saturday arvo
      { id: uuidv4(), user_id: user3, day_of_week: 1, start_time: '05:30', end_time: '07:00', created_at: new Date() },
      { id: uuidv4(), user_id: user3, day_of_week: 3, start_time: '05:30', end_time: '07:00', created_at: new Date() },
      { id: uuidv4(), user_id: user3, day_of_week: 5, start_time: '05:30', end_time: '07:00', created_at: new Date() },
      { id: uuidv4(), user_id: user3, day_of_week: 6, start_time: '14:00', end_time: '17:00', created_at: new Date() },

      // Sarah - Morning swimmer + weekend afternoons
      { id: uuidv4(), user_id: user4, day_of_week: 1, start_time: '06:00', end_time: '08:00', created_at: new Date() },
      { id: uuidv4(), user_id: user4, day_of_week: 2, start_time: '06:00', end_time: '08:00', created_at: new Date() },
      { id: uuidv4(), user_id: user4, day_of_week: 4, start_time: '06:00', end_time: '08:00', created_at: new Date() },
      { id: uuidv4(), user_id: user4, day_of_week: 0, start_time: '13:00', end_time: '17:00', created_at: new Date() },
      { id: uuidv4(), user_id: user4, day_of_week: 6, start_time: '10:00', end_time: '16:00', created_at: new Date() },

      // Marco - Lunch & evenings
      { id: uuidv4(), user_id: user5, day_of_week: 1, start_time: '12:00', end_time: '13:30', created_at: new Date() },
      { id: uuidv4(), user_id: user5, day_of_week: 3, start_time: '12:00', end_time: '13:30', created_at: new Date() },
      { id: uuidv4(), user_id: user5, day_of_week: 5, start_time: '18:00', end_time: '21:00', created_at: new Date() },
      { id: uuidv4(), user_id: user5, day_of_week: 6, start_time: '10:00', end_time: '14:00', created_at: new Date() },

      // Emma - Mornings everywhere
      { id: uuidv4(), user_id: user6, day_of_week: 1, start_time: '07:00', end_time: '09:00', created_at: new Date() },
      { id: uuidv4(), user_id: user6, day_of_week: 2, start_time: '07:00', end_time: '09:00', created_at: new Date() },
      { id: uuidv4(), user_id: user6, day_of_week: 3, start_time: '07:00', end_time: '09:00', created_at: new Date() },
      { id: uuidv4(), user_id: user6, day_of_week: 4, start_time: '07:00', end_time: '09:00', created_at: new Date() },
      { id: uuidv4(), user_id: user6, day_of_week: 5, start_time: '07:00', end_time: '09:00', created_at: new Date() },
      { id: uuidv4(), user_id: user6, day_of_week: 6, start_time: '08:00', end_time: '12:00', created_at: new Date() },
      { id: uuidv4(), user_id: user6, day_of_week: 0, start_time: '08:00', end_time: '12:00', created_at: new Date() },
    ]);

    console.log('✓ Seeded 6 demo playpal users with sports, skills, and availability');
  },

  async down(queryInterface, Sequelize) {
    // Remove in reverse dependency order
    await queryInterface.bulkDelete('user_availability', {
      user_id: {
        [Sequelize.Op.in]: queryInterface.sequelize.literal(
          "(SELECT id FROM users WHERE email LIKE '%@demo.oval')"
        ),
      },
    });
    await queryInterface.bulkDelete('user_sports_skills', {
      user_id: {
        [Sequelize.Op.in]: queryInterface.sequelize.literal(
          "(SELECT id FROM users WHERE email LIKE '%@demo.oval')"
        ),
      },
    });
    await queryInterface.bulkDelete('users', {
      email: { [Sequelize.Op.like]: '%@demo.oval' },
    });
  },
};
