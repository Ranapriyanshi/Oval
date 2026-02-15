'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get current users
    const [users] = await queryInterface.sequelize.query(
      `SELECT id, name, email FROM users ORDER BY created_at ASC`
    );

    if (users.length < 3) {
      console.log('Not enough users for demo conversations. Skipping.');
      return;
    }

    // Main user (first registered) and demo users
    const mainUser = users[0]; // Priyanshi
    const demoUsers = users.slice(1, 5); // Alex, Priya, James, Sarah

    // Ensure matches exist between main user and demo users
    for (const demo of demoUsers) {
      const [p1, p2] = mainUser.id < demo.id
        ? [mainUser.id, demo.id]
        : [demo.id, mainUser.id];

      const [existingMatch] = await queryInterface.sequelize.query(
        `SELECT id FROM user_matches WHERE (user1_id = '${p1}' AND user2_id = '${p2}') OR (user1_id = '${p2}' AND user2_id = '${p1}') LIMIT 1`
      );

      if (existingMatch.length === 0) {
        await queryInterface.sequelize.query(
          `INSERT INTO user_matches (id, user1_id, user2_id, is_active, matched_at, created_at)
           VALUES (gen_random_uuid(), '${p1}', '${p2}', true, NOW(), NOW())`
        );
      }
    }

    // Create conversations with messages
    const now = new Date();
    const conversations = [];

    for (let i = 0; i < demoUsers.length; i++) {
      const demo = demoUsers[i];
      const [cp1, cp2] = mainUser.id < demo.id
        ? [mainUser.id, demo.id]
        : [demo.id, mainUser.id];

      // Check if conversation already exists
      const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM conversations WHERE participant1_id = '${cp1}' AND participant2_id = '${cp2}' LIMIT 1`
      );

      if (existing.length > 0) continue;

      // Create conversation
      const [conv] = await queryInterface.sequelize.query(
        `INSERT INTO conversations (id, participant1_id, participant2_id, created_at, updated_at)
         VALUES (gen_random_uuid(), '${cp1}', '${cp2}', NOW(), NOW())
         RETURNING id`
      );

      const convId = conv[0].id;
      conversations.push({ convId, demo, index: i });
    }

    // Sample chat messages for each conversation
    const chatScripts = [
      // Conversation with Alex Chen (Tennis)
      [
        { fromMain: false, content: 'Hey! Saw you play tennis too. Which courts do you usually go to?', mins: 120 },
        { fromMain: true, content: 'Hi Alex! I usually play at the park courts near CBD. You?', mins: 115 },
        { fromMain: false, content: 'Nice! I go to Melbourne Park mostly. We should hit sometime!', mins: 110 },
        { fromMain: true, content: 'Absolutely! How about this weekend? Saturday morning?', mins: 105 },
        { fromMain: false, content: 'Saturday works! Let\'s say 9am? I can book a court', mins: 60 },
        { fromMain: true, content: 'Perfect, see you there! 🎾', mins: 55 },
      ],
      // Conversation with Priya Sharma
      [
        { fromMain: true, content: 'Hey Priya! I see we both like badminton and running', mins: 180 },
        { fromMain: false, content: 'Hi! Yes! I\'ve been looking for a badminton partner actually', mins: 170 },
        { fromMain: true, content: 'That\'s great! What level would you say you\'re at?', mins: 165 },
        { fromMain: false, content: 'Intermediate I\'d say. I played in college but haven\'t competed in a while', mins: 150 },
        { fromMain: true, content: 'Same here! We should play doubles sometime too', mins: 145 },
      ],
      // Conversation with James O'Brien (Runner)
      [
        { fromMain: false, content: 'Hey there! Want to join our running group this Thursday?', mins: 30 },
        { fromMain: true, content: 'Oh that sounds fun! What time and where?', mins: 25 },
        { fromMain: false, content: 'We meet at 6:30am at the Botanical Gardens main entrance. Usually do a 5-8km loop', mins: 20 },
      ],
      // Conversation with Sarah Kim (Swimmer)
      [
        { fromMain: false, content: 'Welcome to Oval! I noticed you\'re into swimming too 🏊', mins: 300 },
        { fromMain: true, content: 'Thanks Sarah! Yes I try to swim a few times a week', mins: 280 },
      ],
    ];

    for (const { convId, demo, index } of conversations) {
      const script = chatScripts[index];
      if (!script) continue;

      let lastMessageId = null;
      let lastMessageAt = null;

      for (const msg of script) {
        const senderId = msg.fromMain ? mainUser.id : demo.id;
        const createdAt = new Date(now.getTime() - msg.mins * 60000);

        const [inserted] = await queryInterface.sequelize.query(
          `INSERT INTO messages (id, conversation_id, sender_id, content, message_type, is_read, created_at)
           VALUES (gen_random_uuid(), '${convId}', '${senderId}', '${msg.content.replace(/'/g, "''")}', 'text', ${msg.fromMain ? 'true' : 'false'}, '${createdAt.toISOString()}')
           RETURNING id, created_at`
        );

        lastMessageId = inserted[0].id;
        lastMessageAt = inserted[0].created_at;
      }

      // Update conversation with last message
      if (lastMessageId) {
        await queryInterface.sequelize.query(
          `UPDATE conversations SET last_message_id = '${lastMessageId}', last_message_at = NOW(), updated_at = NOW() WHERE id = '${convId}'`
        );
      }
    }

    console.log(`Created ${conversations.length} demo conversations with messages`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`DELETE FROM messages WHERE message_type = 'text'`);
    await queryInterface.sequelize.query(`DELETE FROM conversations`);
  },
};
