'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const passwordHash = await bcrypt.hash('password123', 10);

    // Create coach users
    const coachUsers = [
      {
        email: 'coach.sarah@demo.oval',
        name: 'Sarah Mitchell',
        city: 'Melbourne',
        bio: 'Former national tennis champion turned coach. I help players of all levels improve their game with personalized training programs.',
        latitude: -37.8136,
        longitude: 144.9631,
      },
      {
        email: 'coach.raj@demo.oval',
        name: 'Raj Patel',
        city: 'Sydney',
        bio: 'Cricket coach with 15+ years experience. Specializing in batting technique, bowling variations, and fielding strategy.',
        latitude: -33.8688,
        longitude: 151.2093,
      },
      {
        email: 'coach.emma@demo.oval',
        name: 'Emma Torres',
        city: 'Melbourne',
        bio: 'Swimming instructor and fitness coach. From beginners learning strokes to competitive swimmers seeking performance gains.',
        latitude: -37.8186,
        longitude: 144.9562,
      },
      {
        email: 'coach.mike@demo.oval',
        name: 'Mike Johnson',
        city: 'Brisbane',
        bio: 'Basketball coach and former college player. I focus on fundamentals, game IQ, and helping you reach the next level.',
        latitude: -27.4698,
        longitude: 153.0251,
      },
    ];

    // Insert coach users
    for (const u of coachUsers) {
      await queryInterface.sequelize.query(
        `INSERT INTO users (id, email, name, password_hash, country, timezone, currency, karma_points, city, bio, latitude, longitude, created_at, updated_at)
         VALUES (gen_random_uuid(), '${u.email}', '${u.name}', '${passwordHash}', 'AU', 'Australia/Sydney', 'AUD', ${Math.floor(Math.random() * 500) + 100}, '${u.city}', '${u.bio.replace(/'/g, "''")}', ${u.latitude}, ${u.longitude}, NOW(), NOW())
         ON CONFLICT (email) DO NOTHING`
      );
    }

    // Get inserted coach user IDs
    const [users] = await queryInterface.sequelize.query(
      `SELECT id, email, name FROM users WHERE email IN ('coach.sarah@demo.oval', 'coach.raj@demo.oval', 'coach.emma@demo.oval', 'coach.mike@demo.oval') ORDER BY email`
    );

    if (users.length === 0) {
      console.log('Coach users already exist or failed to create. Skipping.');
      return;
    }

    const coachProfiles = [
      {
        email: 'coach.emma@demo.oval',
        bio: 'Swimming instructor and fitness coach with 8 years of experience. Certified by Swimming Australia.',
        experience_years: 8,
        hourly_rate: 70,
        specializations: ['Swimming', 'Fitness', 'Water Polo'],
        certifications: ['Swimming Australia Level 3', 'First Aid Certified', 'Fitness Australia Registered'],
        is_verified: true,
        rating_avg: 4.7,
        rating_count: 23,
        total_sessions: 156,
        city: 'Melbourne',
      },
      {
        email: 'coach.mike@demo.oval',
        bio: 'Basketball coach and former college player with a passion for developing young talent.',
        experience_years: 10,
        hourly_rate: 65,
        specializations: ['Basketball', 'Fitness', 'Team Strategy'],
        certifications: ['Basketball Australia Coach Level 2', 'Sports Science Diploma'],
        is_verified: true,
        rating_avg: 4.5,
        rating_count: 18,
        total_sessions: 210,
        city: 'Brisbane',
      },
      {
        email: 'coach.raj@demo.oval',
        bio: 'Cricket coach specializing in batting and bowling technique for all ages.',
        experience_years: 15,
        hourly_rate: 80,
        specializations: ['Cricket', 'Batting', 'Bowling', 'Fielding'],
        certifications: ['Cricket Australia Level 3', 'Community Coaching Certificate', 'Sports Management Degree'],
        is_verified: true,
        rating_avg: 4.8,
        rating_count: 42,
        total_sessions: 380,
        city: 'Sydney',
      },
      {
        email: 'coach.sarah@demo.oval',
        bio: 'Former national tennis champion. Personalized coaching for beginners to advanced players.',
        experience_years: 12,
        hourly_rate: 90,
        specializations: ['Tennis', 'Fitness', 'Mental Coaching'],
        certifications: ['Tennis Australia High Performance Coach', 'Sports Psychology Certificate', 'First Aid'],
        is_verified: true,
        rating_avg: 4.9,
        rating_count: 56,
        total_sessions: 520,
        city: 'Melbourne',
      },
    ];

    for (const profile of coachProfiles) {
      const user = users.find((u) => u.email === profile.email);
      if (!user) continue;

      const specs = `{${profile.specializations.map((s) => `"${s}"`).join(',')}}`;
      const certs = `{${profile.certifications.map((c) => `"${c}"`).join(',')}}`;

      await queryInterface.sequelize.query(
        `INSERT INTO coaches (id, user_id, bio, experience_years, hourly_rate, currency, specializations, certifications, is_verified, is_active, rating_avg, rating_count, total_sessions, city, created_at, updated_at)
         VALUES (gen_random_uuid(), '${user.id}', '${profile.bio.replace(/'/g, "''")}', ${profile.experience_years}, ${profile.hourly_rate}, 'AUD', '${specs}', '${certs}', ${profile.is_verified}, true, ${profile.rating_avg}, ${profile.rating_count}, ${profile.total_sessions}, '${profile.city}', NOW(), NOW())`
      );

      // Get coach ID
      const [coaches] = await queryInterface.sequelize.query(
        `SELECT id FROM coaches WHERE user_id = '${user.id}' LIMIT 1`
      );
      const coachId = coaches[0]?.id;
      if (!coachId) continue;

      // Add availability (weekday mornings + afternoons)
      const days = [1, 2, 3, 4, 5]; // Mon-Fri
      for (const day of days) {
        await queryInterface.sequelize.query(
          `INSERT INTO coach_availabilities (id, coach_id, day_of_week, start_time, end_time, is_active)
           VALUES (gen_random_uuid(), '${coachId}', ${day}, '08:00', '12:00', true)`
        );
        await queryInterface.sequelize.query(
          `INSERT INTO coach_availabilities (id, coach_id, day_of_week, start_time, end_time, is_active)
           VALUES (gen_random_uuid(), '${coachId}', ${day}, '14:00', '18:00', true)`
        );
      }
      // Saturday morning
      await queryInterface.sequelize.query(
        `INSERT INTO coach_availabilities (id, coach_id, day_of_week, start_time, end_time, is_active)
         VALUES (gen_random_uuid(), '${coachId}', 6, '09:00', '13:00', true)`
      );
    }

    console.log(`Created ${coachProfiles.length} demo coaches with availability`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`DELETE FROM coach_ratings`);
    await queryInterface.sequelize.query(`DELETE FROM coaching_sessions`);
    await queryInterface.sequelize.query(`DELETE FROM coach_availabilities`);
    await queryInterface.sequelize.query(`DELETE FROM coaches`);
    await queryInterface.sequelize.query(
      `DELETE FROM users WHERE email IN ('coach.sarah@demo.oval', 'coach.raj@demo.oval', 'coach.emma@demo.oval', 'coach.mike@demo.oval')`
    );
  },
};
