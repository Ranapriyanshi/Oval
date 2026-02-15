import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';
import type User from './User';
import type Coach from './Coach';

export interface CoachRatingAttributes {
  id: string;
  coach_id: string;
  user_id: string;
  session_id?: string | null;
  rating: number;
  review?: string | null;
  created_at: Date;
}

export interface CoachRatingCreationAttributes
  extends Optional<CoachRatingAttributes, 'id' | 'session_id' | 'review' | 'created_at'> {}

class CoachRating
  extends Model<CoachRatingAttributes, CoachRatingCreationAttributes>
  implements CoachRatingAttributes
{
  public id!: string;
  public coach_id!: string;
  public user_id!: string;
  public session_id!: string | null;
  public rating!: number;
  public review!: string | null;
  public created_at!: Date;

  // Association virtual fields
  public User?: User;
  public Coach?: Coach;
}

CoachRating.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    coach_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'coaches', key: 'id' },
      onDelete: 'CASCADE',
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    session_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'coaching_sessions', key: 'id' },
      onDelete: 'SET NULL',
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    review: {
      type: DataTypes.TEXT,
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
    tableName: 'coach_ratings',
    timestamps: false,
  }
);

export default CoachRating;
