'use strict';

const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Grab existing demo user ids to use as creators
    const [users] = await queryInterface.sequelize.query(
      `SELECT id, name, city, country FROM users WHERE email LIKE '%@demo.oval' ORDER BY name LIMIT 6`
    );

    if (users.length < 2) {
      console.log('⚠ Not enough demo users found – run demo-playpals seed first');
      return;
    }

    // Helper to generate future dates
    const daysFromNow = (days, hour = 10, min = 0) => {
      const d = new Date();
      d.setDate(d.getDate() + days);
      d.setHours(hour, min, 0, 0);
      return d;
    };

    const gt1 = uuidv4();
    const gt2 = uuidv4();
    const gt3 = uuidv4();
    const gt4 = uuidv4();
    const gt5 = uuidv4();
    const gt6 = uuidv4();

    const now = new Date();

    await queryInterface.bulkInsert('gametimes', [
      {
        id: gt1,
        creator_id: users[0].id,
        title: 'Saturday Morning Tennis Doubles',
        sport_name: 'Tennis',
        description: 'Looking for 3 more players for doubles at Rushcutters Bay. All levels welcome, just come and have fun!',
        event_type: 'casual',
        skill_level: 'any',
        venue_name: 'Rushcutters Bay Tennis Courts',
        address: '20 Waratah St, Rushcutters Bay NSW 2011',
        city: 'Sydney',
        country: 'AU',
        latitude: -33.8737,
        longitude: 151.2280,
        start_time: daysFromNow(3, 8, 0),
        end_time: daysFromNow(3, 10, 0),
        max_players: 4,
        current_players: 1,
        cost_per_person_cents: 1500,
        currency: 'AUD',
        status: 'upcoming',
        notes: 'Bring water and sunscreen. I have spare rackets.',
        created_at: now,
        updated_at: now,
      },
      {
        id: gt2,
        creator_id: users[1].id,
        title: 'Competitive 5-a-side Soccer',
        sport_name: 'Soccer',
        description: 'Midweek competitive 5-a-side. Need players who can commit to weekly sessions. Intermediate+ skill level preferred.',
        event_type: 'competitive',
        skill_level: 'intermediate',
        venue_name: 'Moore Park Indoor',
        address: 'Driver Ave, Moore Park NSW 2021',
        city: 'Sydney',
        country: 'AU',
        latitude: -33.8920,
        longitude: 151.2210,
        start_time: daysFromNow(5, 19, 0),
        end_time: daysFromNow(5, 20, 30),
        max_players: 10,
        current_players: 4,
        cost_per_person_cents: 2000,
        currency: 'AUD',
        status: 'upcoming',
        notes: 'Bibs provided. Shin guards required.',
        created_at: now,
        updated_at: now,
      },
      {
        id: gt3,
        creator_id: users[2].id,
        title: 'Early Morning Run Club',
        sport_name: 'Running',
        description: 'Join us for a 10K run along the Yarra! All paces welcome, we regroup at every km mark.',
        event_type: 'casual',
        skill_level: 'any',
        venue_name: 'Southbank Promenade',
        address: 'Southbank Promenade, Southbank VIC 3006',
        city: 'Melbourne',
        country: 'AU',
        latitude: -37.8206,
        longitude: 144.9614,
        start_time: daysFromNow(2, 6, 0),
        end_time: daysFromNow(2, 7, 30),
        max_players: 20,
        current_players: 6,
        cost_per_person_cents: 0,
        currency: 'AUD',
        status: 'upcoming',
        notes: 'Free! Meet at the Crown Promenade entrance. Coffee after.',
        created_at: now,
        updated_at: now,
      },
      {
        id: gt4,
        creator_id: users[3].id,
        title: 'Beach Volleyball Sunset Session',
        sport_name: 'Volleyball',
        description: 'Casual beach volleyball at Bondi. Beginners welcome! We rotate teams so everyone gets a go.',
        event_type: 'casual',
        skill_level: 'beginner',
        venue_name: 'Bondi Beach Courts',
        address: 'Queen Elizabeth Dr, Bondi Beach NSW 2026',
        city: 'Sydney',
        country: 'AU',
        latitude: -33.8908,
        longitude: 151.2743,
        start_time: daysFromNow(4, 16, 30),
        end_time: daysFromNow(4, 18, 30),
        max_players: 12,
        current_players: 3,
        cost_per_person_cents: 0,
        currency: 'AUD',
        status: 'upcoming',
        notes: 'Net and ball provided. BYO drinks.',
        created_at: now,
        updated_at: now,
      },
      {
        id: gt5,
        creator_id: users[4].id,
        title: 'Basketball Pickup Game',
        sport_name: 'Basketball',
        description: 'Weekly pickup hoops at the outdoor courts. Full court 5v5 when we get enough people, half court otherwise.',
        event_type: 'competitive',
        skill_level: 'advanced',
        venue_name: 'Tompkins Square Park Courts',
        address: 'E 7th St, New York, NY 10009',
        city: 'New York',
        country: 'US',
        latitude: 40.7265,
        longitude: -73.9818,
        start_time: daysFromNow(6, 17, 0),
        end_time: daysFromNow(6, 19, 0),
        max_players: 10,
        current_players: 2,
        cost_per_person_cents: 0,
        currency: 'USD',
        status: 'upcoming',
        notes: 'Bring your own ball if you have one.',
        created_at: now,
        updated_at: now,
      },
      {
        id: gt6,
        creator_id: users[5].id,
        title: 'Yoga in the Park - Flow Session',
        sport_name: 'Yoga',
        description: 'Outdoor vinyasa flow suitable for all levels. I\'m a certified instructor and will guide the class.',
        event_type: 'training',
        skill_level: 'any',
        venue_name: 'Hyde Park',
        address: 'Elizabeth St, Sydney NSW 2000',
        city: 'Sydney',
        country: 'AU',
        latitude: -33.8731,
        longitude: 151.2114,
        start_time: daysFromNow(1, 7, 0),
        end_time: daysFromNow(1, 8, 0),
        max_players: 15,
        current_players: 5,
        cost_per_person_cents: 1000,
        currency: 'AUD',
        status: 'upcoming',
        notes: 'BYO mat. I have 2 spare mats if you don\'t have one.',
        created_at: now,
        updated_at: now,
      },
    ]);

    // Add some participants to events (creators already counted in current_players above)
    const participantRows = [];

    // Creator auto-joins
    participantRows.push({ id: uuidv4(), gametime_id: gt1, user_id: users[0].id, status: 'joined', joined_at: now });
    participantRows.push({ id: uuidv4(), gametime_id: gt2, user_id: users[1].id, status: 'joined', joined_at: now });
    participantRows.push({ id: uuidv4(), gametime_id: gt3, user_id: users[2].id, status: 'joined', joined_at: now });
    participantRows.push({ id: uuidv4(), gametime_id: gt4, user_id: users[3].id, status: 'joined', joined_at: now });
    participantRows.push({ id: uuidv4(), gametime_id: gt5, user_id: users[4].id, status: 'joined', joined_at: now });
    participantRows.push({ id: uuidv4(), gametime_id: gt6, user_id: users[5].id, status: 'joined', joined_at: now });

    // Extra participants (matching the current_players counts)
    if (users[2]) participantRows.push({ id: uuidv4(), gametime_id: gt2, user_id: users[2].id, status: 'joined', joined_at: now });
    if (users[3]) participantRows.push({ id: uuidv4(), gametime_id: gt2, user_id: users[3].id, status: 'joined', joined_at: now });
    if (users[5]) participantRows.push({ id: uuidv4(), gametime_id: gt2, user_id: users[5].id, status: 'joined', joined_at: now });

    // Run club extra runners
    if (users[0]) participantRows.push({ id: uuidv4(), gametime_id: gt3, user_id: users[0].id, status: 'joined', joined_at: now });
    if (users[1]) participantRows.push({ id: uuidv4(), gametime_id: gt3, user_id: users[1].id, status: 'joined', joined_at: now });
    if (users[3]) participantRows.push({ id: uuidv4(), gametime_id: gt3, user_id: users[3].id, status: 'joined', joined_at: now });
    if (users[4]) participantRows.push({ id: uuidv4(), gametime_id: gt3, user_id: users[4].id, status: 'joined', joined_at: now });
    if (users[5]) participantRows.push({ id: uuidv4(), gametime_id: gt3, user_id: users[5].id, status: 'joined', joined_at: now });

    // Volleyball extras
    if (users[0]) participantRows.push({ id: uuidv4(), gametime_id: gt4, user_id: users[0].id, status: 'joined', joined_at: now });
    if (users[1]) participantRows.push({ id: uuidv4(), gametime_id: gt4, user_id: users[1].id, status: 'joined', joined_at: now });

    // Basketball extra
    if (users[0]) participantRows.push({ id: uuidv4(), gametime_id: gt5, user_id: users[0].id, status: 'joined', joined_at: now });

    // Yoga extras
    if (users[0]) participantRows.push({ id: uuidv4(), gametime_id: gt6, user_id: users[0].id, status: 'joined', joined_at: now });
    if (users[1]) participantRows.push({ id: uuidv4(), gametime_id: gt6, user_id: users[1].id, status: 'joined', joined_at: now });
    if (users[2]) participantRows.push({ id: uuidv4(), gametime_id: gt6, user_id: users[2].id, status: 'joined', joined_at: now });
    if (users[3]) participantRows.push({ id: uuidv4(), gametime_id: gt6, user_id: users[3].id, status: 'joined', joined_at: now });

    await queryInterface.bulkInsert('gametime_participants', participantRows);

    console.log('✓ Seeded 6 demo gametime events with participants');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('gametime_participants', null, {});
    await queryInterface.bulkDelete('gametimes', null, {});
  },
};
