import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

export interface EventAttributes {
  id: string;
  organizer_id: string;
  title: string;
  sport_name: string;
  event_type: 'tournament' | 'meetup' | 'league';
  description?: string | null;
  venue_id?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  start_time: Date;
  end_time: Date;
  max_participants: number;
  registration_deadline?: Date | null;
  status: 'draft' | 'open' | 'closed' | 'completed' | 'cancelled';
  bracket_type?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface EventCreationAttributes
  extends Optional<
    EventAttributes,
    | 'id'
    | 'description'
    | 'venue_id'
    | 'address'
    | 'city'
    | 'country'
    | 'registration_deadline'
    | 'bracket_type'
    | 'created_at'
    | 'updated_at'
  > {}

class Event extends Model<EventAttributes, EventCreationAttributes> implements EventAttributes {
  public id!: string;
  public organizer_id!: string;
  public title!: string;
  public sport_name!: string;
  public event_type!: 'tournament' | 'meetup' | 'league';
  public description!: string | null;
  public venue_id!: string | null;
  public address!: string | null;
  public city!: string | null;
  public country!: string | null;
  public start_time!: Date;
  public end_time!: Date;
  public max_participants!: number;
  public registration_deadline!: Date | null;
  public status!: 'draft' | 'open' | 'closed' | 'completed' | 'cancelled';
  public bracket_type!: string | null;
  public created_at!: Date;
  public updated_at!: Date;
}

Event.init(
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    organizer_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    title: { type: DataTypes.STRING(200), allowNull: false },
    sport_name: { type: DataTypes.STRING(100), allowNull: false },
    event_type: {
      type: DataTypes.ENUM('tournament', 'meetup', 'league'),
      allowNull: false,
      defaultValue: 'meetup',
    },
    description: { type: DataTypes.TEXT, allowNull: true },
    venue_id: { type: DataTypes.UUID, allowNull: true, references: { model: 'venues', key: 'id' }, onDelete: 'SET NULL' },
    address: { type: DataTypes.STRING(500), allowNull: true },
    city: { type: DataTypes.STRING(100), allowNull: true },
    country: { type: DataTypes.STRING(10), allowNull: true },
    start_time: { type: DataTypes.DATE, allowNull: false },
    end_time: { type: DataTypes.DATE, allowNull: false },
    max_participants: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 32 },
    registration_deadline: { type: DataTypes.DATE, allowNull: true },
    status: {
      type: DataTypes.ENUM('draft', 'open', 'closed', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'open',
    },
    bracket_type: { type: DataTypes.STRING(50), allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, tableName: 'events', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' }
);

export default Event;
