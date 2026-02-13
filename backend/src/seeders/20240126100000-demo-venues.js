'use strict';

const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const venueId1 = uuidv4();
    const venueId2 = uuidv4();
    const venueId3 = uuidv4();

    await queryInterface.bulkInsert('venues', [
      {
        id: venueId1,
        name: 'Melbourne Sports Complex',
        address: '100 Olympic Blvd, Melbourne VIC 3000',
        city: 'Melbourne',
        state_region: 'VIC',
        country_code: 'AU',
        latitude: -37.8136,
        longitude: 144.9631,
        description: 'Multi-sport facility with indoor and outdoor courts.',
        amenities: JSON.stringify(['Parking', 'Showers', 'Cafe', 'Equipment hire']),
        currency: 'AUD',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: venueId2,
        name: 'Sydney Tennis & Badminton Centre',
        address: '45 Court Lane, Sydney NSW 2000',
        city: 'Sydney',
        state_region: 'NSW',
        country_code: 'AU',
        latitude: -33.8688,
        longitude: 151.2093,
        description: 'Dedicated tennis and badminton courts with professional lighting.',
        amenities: JSON.stringify(['Parking', 'Showers', 'Pro shop']),
        currency: 'AUD',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: venueId3,
        name: 'Brisbane Cricket & Football Ground',
        address: '200 Field Rd, Brisbane QLD 4000',
        city: 'Brisbane',
        state_region: 'QLD',
        country_code: 'AU',
        latitude: -27.4698,
        longitude: 153.0251,
        description: 'Outdoor cricket nets and football fields.',
        amenities: JSON.stringify(['Parking', 'Changing rooms', 'Canteen']),
        currency: 'AUD',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    await queryInterface.bulkInsert('venue_sports', [
      { id: uuidv4(), venue_id: venueId1, sport_name: 'Tennis', hourly_rate_cents: 4500, created_at: new Date() },
      { id: uuidv4(), venue_id: venueId1, sport_name: 'Basketball', hourly_rate_cents: 3500, created_at: new Date() },
      { id: uuidv4(), venue_id: venueId1, sport_name: 'Badminton', hourly_rate_cents: 3000, created_at: new Date() },
      { id: uuidv4(), venue_id: venueId2, sport_name: 'Tennis', hourly_rate_cents: 5000, created_at: new Date() },
      { id: uuidv4(), venue_id: venueId2, sport_name: 'Badminton', hourly_rate_cents: 2800, created_at: new Date() },
      { id: uuidv4(), venue_id: venueId3, sport_name: 'Cricket', hourly_rate_cents: 6000, created_at: new Date() },
      { id: uuidv4(), venue_id: venueId3, sport_name: 'Football', hourly_rate_cents: 4000, created_at: new Date() },
    ]);

    await queryInterface.bulkInsert('venue_schedules', [
      { id: uuidv4(), venue_id: venueId1, day_of_week: 1, open_time: '07:00', close_time: '22:00', created_at: new Date() },
      { id: uuidv4(), venue_id: venueId1, day_of_week: 2, open_time: '07:00', close_time: '22:00', created_at: new Date() },
      { id: uuidv4(), venue_id: venueId1, day_of_week: 3, open_time: '07:00', close_time: '22:00', created_at: new Date() },
      { id: uuidv4(), venue_id: venueId1, day_of_week: 4, open_time: '07:00', close_time: '22:00', created_at: new Date() },
      { id: uuidv4(), venue_id: venueId1, day_of_week: 5, open_time: '07:00', close_time: '22:00', created_at: new Date() },
      { id: uuidv4(), venue_id: venueId1, day_of_week: 6, open_time: '08:00', close_time: '20:00', created_at: new Date() },
      { id: uuidv4(), venue_id: venueId1, day_of_week: 0, open_time: '09:00', close_time: '18:00', created_at: new Date() },
      { id: uuidv4(), venue_id: venueId2, day_of_week: 1, open_time: '06:00', close_time: '23:00', created_at: new Date() },
      { id: uuidv4(), venue_id: venueId2, day_of_week: 2, open_time: '06:00', close_time: '23:00', created_at: new Date() },
      { id: uuidv4(), venue_id: venueId2, day_of_week: 3, open_time: '06:00', close_time: '23:00', created_at: new Date() },
      { id: uuidv4(), venue_id: venueId2, day_of_week: 4, open_time: '06:00', close_time: '23:00', created_at: new Date() },
      { id: uuidv4(), venue_id: venueId2, day_of_week: 5, open_time: '06:00', close_time: '23:00', created_at: new Date() },
      { id: uuidv4(), venue_id: venueId2, day_of_week: 6, open_time: '07:00', close_time: '21:00', created_at: new Date() },
      { id: uuidv4(), venue_id: venueId2, day_of_week: 0, open_time: '08:00', close_time: '20:00', created_at: new Date() },
      { id: uuidv4(), venue_id: venueId3, day_of_week: 1, open_time: '08:00', close_time: '20:00', created_at: new Date() },
      { id: uuidv4(), venue_id: venueId3, day_of_week: 2, open_time: '08:00', close_time: '20:00', created_at: new Date() },
      { id: uuidv4(), venue_id: venueId3, day_of_week: 3, open_time: '08:00', close_time: '20:00', created_at: new Date() },
      { id: uuidv4(), venue_id: venueId3, day_of_week: 4, open_time: '08:00', close_time: '20:00', created_at: new Date() },
      { id: uuidv4(), venue_id: venueId3, day_of_week: 5, open_time: '08:00', close_time: '20:00', created_at: new Date() },
      { id: uuidv4(), venue_id: venueId3, day_of_week: 6, open_time: '08:00', close_time: '18:00', created_at: new Date() },
      { id: uuidv4(), venue_id: venueId3, day_of_week: 0, open_time: '09:00', close_time: '17:00', created_at: new Date() },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('venue_schedules', null, {});
    await queryInterface.bulkDelete('venue_sports', null, {});
    await queryInterface.bulkDelete('venue_images', null, {});
    await queryInterface.bulkDelete('venue_ratings', null, {});
    await queryInterface.bulkDelete('bookings', null, {});
    await queryInterface.bulkDelete('venues', null, {});
  },
};
