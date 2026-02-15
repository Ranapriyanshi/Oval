'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'achievements',
      [
        { id: require('crypto').randomUUID(), key: 'first_match', name: 'First Match', description: 'Play your first match', icon: '🎾', criteria_type: 'matches_played', criteria_value: 1, created_at: new Date() },
        { id: require('crypto').randomUUID(), key: 'ten_matches', name: 'Getting Started', description: 'Play 10 matches', icon: '🏃', criteria_type: 'matches_played', criteria_value: 10, created_at: new Date() },
        { id: require('crypto').randomUUID(), key: 'fifty_matches', name: 'Regular Player', description: 'Play 50 matches', icon: '⭐', criteria_type: 'matches_played', criteria_value: 50, created_at: new Date() },
        { id: require('crypto').randomUUID(), key: 'karma_10', name: 'Good Sport', description: 'Earn 10 karma points', icon: '👍', criteria_type: 'karma', criteria_value: 10, created_at: new Date() },
        { id: require('crypto').randomUUID(), key: 'karma_50', name: 'Community Star', description: 'Earn 50 karma points', icon: '🌟', criteria_type: 'karma', criteria_value: 50, created_at: new Date() },
      ],
      { ignoreDuplicates: true }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('achievements', null, {});
  },
};
