import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';
import type User from './User';

export interface GametimeParticipantAttributes {
  id: string;
  gametime_id: string;
  user_id: string;
  status: 'joined' | 'left' | 'removed';
  joined_at: Date;
}

export interface GametimeParticipantCreationAttributes
  extends Optional<GametimeParticipantAttributes, 'id' | 'status' | 'joined_at'> {}

class GametimeParticipant
  extends Model<GametimeParticipantAttributes, GametimeParticipantCreationAttributes>
  implements GametimeParticipantAttributes
{
  public id!: string;
  public gametime_id!: string;
  public user_id!: string;
  public status!: 'joined' | 'left' | 'removed';
  public joined_at!: Date;

  // Association virtual fields
  public User?: User;
}

GametimeParticipant.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    gametime_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'gametimes', key: 'id' },
      onDelete: 'CASCADE',
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    status: {
      type: DataTypes.ENUM('joined', 'left', 'removed'),
      allowNull: false,
      defaultValue: 'joined',
    },
    joined_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'gametime_participants',
    timestamps: false,
  }
);

export default GametimeParticipant;
