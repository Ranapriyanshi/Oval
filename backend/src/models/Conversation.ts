import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';
import type User from './User';
import type Message from './Message';

export interface ConversationAttributes {
  id: string;
  participant1_id: string;
  participant2_id: string;
  last_message_id?: string | null;
  last_message_at?: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface ConversationCreationAttributes
  extends Optional<ConversationAttributes, 'id' | 'last_message_id' | 'last_message_at' | 'created_at' | 'updated_at'> {}

class Conversation
  extends Model<ConversationAttributes, ConversationCreationAttributes>
  implements ConversationAttributes
{
  public id!: string;
  public participant1_id!: string;
  public participant2_id!: string;
  public last_message_id!: string | null;
  public last_message_at!: Date | null;
  public created_at!: Date;
  public updated_at!: Date;

  // Association virtual fields
  public Participant1?: User;
  public Participant2?: User;
  public LastMessage?: Message;
  public Messages?: Message[];
}

Conversation.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    participant1_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    participant2_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    last_message_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    last_message_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'conversations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Conversation;
