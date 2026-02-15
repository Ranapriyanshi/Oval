import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

export interface UserStatsAttributes {
  id: string;
  user_id: string;
  sport: string;
  matches_played: number;
  wins: number;
  losses: number;
  draws: number;
  hours_played: number;
  created_at: Date;
  updated_at: Date;
}

export interface UserStatsCreationAttributes
  extends Optional<
    UserStatsAttributes,
    'id' | 'matches_played' | 'wins' | 'losses' | 'draws' | 'hours_played' | 'created_at' | 'updated_at'
  > {}

class UserStats extends Model<UserStatsAttributes, UserStatsCreationAttributes> implements UserStatsAttributes {
  public id!: string;
  public user_id!: string;
  public sport!: string;
  public matches_played!: number;
  public wins!: number;
  public losses!: number;
  public draws!: number;
  public hours_played!: number;
  public created_at!: Date;
  public updated_at!: Date;
}

UserStats.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    sport: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    matches_played: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    wins: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    losses: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    draws: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    hours_played: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false,
      defaultValue: 0,
      get() {
        const value = this.getDataValue('hours_played');
        return value != null ? Number(value) : 0;
      },
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
    tableName: 'user_stats',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default UserStats;
