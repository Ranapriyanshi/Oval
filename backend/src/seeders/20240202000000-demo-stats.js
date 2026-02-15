'use strict';

const uuidv4 = () => require('crypto').randomUUID();

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const [users] = await queryInterface.sequelize.query(
      `SELECT id FROM users ORDER BY created_at ASC LIMIT 10`
    );
    if (!users || users.length === 0) return;

    const sports = ['Tennis', 'Basketball', 'Football', 'Badminton', 'Cricket'];
    const statsRows = [];
    users.forEach((u, i) => {
      const numSports = 1 + (i % 3);
      for (let j = 0; j < numSports; j++) {
        const sport = sports[(i + j) % sports.length];
        statsRows.push({
          id: uuidv4(),
          user_id: u.id,
          sport,
          matches_played: 5 + (i + j) * 3,
          wins: 2 + (i + j),
          losses: 1 + j,
          draws: 0,
          hours_played: (10 + (i + j) * 5).toFixed(2),
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    });
    if (statsRows.length > 0) {
      await queryInterface.bulkInsert('user_stats', statsRows, { ignoreDuplicates: true });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('user_stats', null, {});
  },
};
