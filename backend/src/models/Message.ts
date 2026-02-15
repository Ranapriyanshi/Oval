import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';
import type User from './User';

export interface MessageAttributes {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'system';
  is_read: boolean;
  read_at?: Date | null;
  created_at: Date;
}

export interface MessageCreationAttributes
  extends Optional<MessageAttributes, 'id' | 'message_type' | 'is_read' | 'read_at' | 'created_at'> {}

class Message
  extends Model<MessageAttributes, MessageCreationAttributes>
  implements MessageAttributes
{
  public id!: string;
  public conversation_id!: string;
  public sender_id!: string;
  public content!: string;
  public message_type!: 'text' | 'image' | 'system';
  public is_read!: boolean;
  public read_at!: Date | null;
  public created_at!: Date;

  // Association virtual fields
  public Sender?: User;
}

Message.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    conversation_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'conversations', key: 'id' },
      onDelete: 'CASCADE',
    },
    sender_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    message_type: {
      type: DataTypes.ENUM('text', 'image', 'system'),
      allowNull: false,
      defaultValue: 'text',
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'messages',
    timestamps: false,
  }
);

export default Message;
