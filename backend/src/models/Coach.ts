import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';
import type User from './User';

export interface CoachAttributes {
  id: string;
  user_id: string;
  bio: string;
  experience_years: number;
  hourly_rate: number;
  currency: string;
  specializations: string[];
  certifications: string[];
  is_verified: boolean;
  is_active: boolean;
  rating_avg: number;
  rating_count: number;
  total_sessions: number;
  city?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CoachCreationAttributes
  extends Optional<CoachAttributes, 'id' | 'is_verified' | 'is_active' | 'rating_avg' | 'rating_count' | 'total_sessions' | 'city' | 'latitude' | 'longitude' | 'created_at' | 'updated_at'> {}

class Coach
  extends Model<CoachAttributes, CoachCreationAttributes>
  implements CoachAttributes
{
  public id!: string;
  public user_id!: string;
  public bio!: string;
  public experience_years!: number;
  public hourly_rate!: number;
  public currency!: string;
  public specializations!: string[];
  public certifications!: string[];
  public is_verified!: boolean;
  public is_active!: boolean;
  public rating_avg!: number;
  public rating_count!: number;
  public total_sessions!: number;
  public city!: string | null;
  public latitude!: string | null;
  public longitude!: string | null;
  public created_at!: Date;
  public updated_at!: Date;

  // Association virtual fields
  public User?: User;
  public CoachAvailabilities?: any[];
  public CoachRatings?: any[];
}

Coach.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    experience_years: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    hourly_rate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'AUD',
    },
    specializations: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: false,
      defaultValue: [],
    },
    certifications: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: false,
      defaultValue: [],
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    rating_avg: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 0,
    },
    rating_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    total_sessions: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
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
    tableName: 'coaches',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Coach;
