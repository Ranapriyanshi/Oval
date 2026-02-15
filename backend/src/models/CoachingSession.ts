import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';
import type User from './User';
import type Coach from './Coach';

export interface CoachingSessionAttributes {
  id: string;
  coach_id: string;
  student_id: string;
  sport: string;
  session_date: Date;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string | null;
  cost: number;
  currency: string;
  location?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CoachingSessionCreationAttributes
  extends Optional<CoachingSessionAttributes, 'id' | 'status' | 'notes' | 'location' | 'created_at' | 'updated_at'> {}

class CoachingSession
  extends Model<CoachingSessionAttributes, CoachingSessionCreationAttributes>
  implements CoachingSessionAttributes
{
  public id!: string;
  public coach_id!: string;
  public student_id!: string;
  public sport!: string;
  public session_date!: Date;
  public start_time!: string;
  public end_time!: string;
  public duration_minutes!: number;
  public status!: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  public notes!: string | null;
  public cost!: number;
  public currency!: string;
  public location!: string | null;
  public created_at!: Date;
  public updated_at!: Date;

  // Association virtual fields
  public Coach?: Coach;
  public Student?: User;
}

CoachingSession.init(
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
    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    sport: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    session_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    start_time: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    end_time: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 60,
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'AUD',
    },
    location: {
      type: DataTypes.STRING(255),
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
    tableName: 'coaching_sessions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default CoachingSession;
