import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';
import type User from './User';

export interface GametimeAttributes {
  id: string;
  creator_id: string;
  title: string;
  sport_name: string;
  description?: string | null;
  event_type: 'casual' | 'competitive' | 'training';
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'any';
  venue_name?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  start_time: Date;
  end_time: Date;
  max_players: number;
  current_players: number;
  cost_per_person_cents: number;
  currency: string;
  status: 'upcoming' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface GametimeCreationAttributes
  extends Optional<
    GametimeAttributes,
    | 'id'
    | 'description'
    | 'venue_name'
    | 'address'
    | 'city'
    | 'country'
    | 'latitude'
    | 'longitude'
    | 'current_players'
    | 'cost_per_person_cents'
    | 'currency'
    | 'status'
    | 'notes'
    | 'created_at'
    | 'updated_at'
  > {}

class Gametime
  extends Model<GametimeAttributes, GametimeCreationAttributes>
  implements GametimeAttributes
{
  public id!: string;
  public creator_id!: string;
  public title!: string;
  public sport_name!: string;
  public description!: string | null;
  public event_type!: 'casual' | 'competitive' | 'training';
  public skill_level!: 'beginner' | 'intermediate' | 'advanced' | 'any';
  public venue_name!: string | null;
  public address!: string | null;
  public city!: string | null;
  public country!: string | null;
  public latitude!: string | null;
  public longitude!: string | null;
  public start_time!: Date;
  public end_time!: Date;
  public max_players!: number;
  public current_players!: number;
  public cost_per_person_cents!: number;
  public currency!: string;
  public status!: 'upcoming' | 'in_progress' | 'completed' | 'cancelled';
  public notes!: string | null;
  public created_at!: Date;
  public updated_at!: Date;

  // Association virtual fields
  public Creator?: User;
  public GametimeParticipants?: any[];
}

Gametime.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    creator_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    sport_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    event_type: {
      type: DataTypes.ENUM('casual', 'competitive', 'training'),
      allowNull: false,
      defaultValue: 'casual',
    },
    skill_level: {
      type: DataTypes.ENUM('beginner', 'intermediate', 'advanced', 'any'),
      allowNull: false,
      defaultValue: 'any',
    },
    venue_name: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING(10),
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
    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    max_players: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
    },
    current_players: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1, // creator counts as first player
    },
    cost_per_person_cents: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'AUD',
    },
    status: {
      type: DataTypes.ENUM('upcoming', 'in_progress', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'upcoming',
    },
    notes: {
      type: DataTypes.TEXT,
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
    tableName: 'gametimes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Gametime;
