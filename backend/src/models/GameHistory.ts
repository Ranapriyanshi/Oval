import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

export interface GameHistoryAttributes {
  id: string;
  gametime_id: string;
  user_id: string;
  sport: string;
  played_at: Date;
  created_at: Date;
}

export interface GameHistoryCreationAttributes
  extends Optional<GameHistoryAttributes, 'id' | 'played_at' | 'created_at'> {}

class GameHistory extends Model<GameHistoryAttributes, GameHistoryCreationAttributes> implements GameHistoryAttributes {
  public id!: string;
  public gametime_id!: string;
  public user_id!: string;
  public sport!: string;
  public played_at!: Date;
  public created_at!: Date;
}

GameHistory.init(
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
    sport: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    played_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'game_history',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

export default GameHistory;
