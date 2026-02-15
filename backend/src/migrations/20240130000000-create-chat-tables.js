'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Conversations table (1-to-1 DMs)
    await queryInterface.createTable('conversations', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      participant1_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      participant2_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      last_message_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      last_message_at: {
        type: Sequelize.DATE,
        allowNull: true,
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

    await queryInterface.addIndex('conversations', ['participant1_id'], { name: 'idx_conversations_p1' });
    await queryInterface.addIndex('conversations', ['participant2_id'], { name: 'idx_conversations_p2' });
    await queryInterface.addIndex('conversations', ['participant1_id', 'participant2_id'], {
      unique: true,
      name: 'conversations_participants_unique',
    });
    await queryInterface.addIndex('conversations', ['last_message_at'], { name: 'idx_conversations_last_msg' });

    // Messages table
    await queryInterface.createTable('messages', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      conversation_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'conversations', key: 'id' },
        onDelete: 'CASCADE',
      },
      sender_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      message_type: {
        type: Sequelize.ENUM('text', 'image', 'system'),
        allowNull: false,
        defaultValue: 'text',
      },
      is_read: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      read_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('messages', ['conversation_id'], { name: 'idx_messages_conversation' });
    await queryInterface.addIndex('messages', ['sender_id'], { name: 'idx_messages_sender' });
    await queryInterface.addIndex('messages', ['conversation_id', 'created_at'], { name: 'idx_messages_conv_time' });

    // Add foreign key for last_message_id now that messages table exists
    await queryInterface.addConstraint('conversations', {
      fields: ['last_message_id'],
      type: 'foreign key',
      name: 'fk_conversations_last_message',
      references: { table: 'messages', field: 'id' },
      onDelete: 'SET NULL',
    });

    // Auto-update trigger
    await queryInterface.sequelize.query(`
      CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
    `);
    await queryInterface.removeConstraint('conversations', 'fk_conversations_last_message');
    await queryInterface.dropTable('messages');
    await queryInterface.dropTable('conversations');
  },
};
