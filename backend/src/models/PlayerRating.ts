import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

export interface PlayerRatingAttributes {
  id: string;
  gametime_id: string;
  rater_id: string;
  rated_user_id: string;
  rating: number;
  sportsmanship: number;
  created_at: Date;
}

export interface PlayerRatingCreationAttributes extends Optional<PlayerRatingAttributes, 'id' | 'created_at'> {}

class PlayerRating
  extends Model<PlayerRatingAttributes, PlayerRatingCreationAttributes>
  implements PlayerRatingAttributes
{
  public id!: string;
  public gametime_id!: string;
  public rater_id!: string;
  public rated_user_id!: string;
  public rating!: number;
  public sportsmanship!: number;
  public created_at!: Date;
}

PlayerRating.init(
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
    rater_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    rated_user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sportsmanship: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'player_ratings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

export default PlayerRating;
