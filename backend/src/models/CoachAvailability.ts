import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

export interface CoachAvailabilityAttributes {
  id: string;
  coach_id: string;
  day_of_week: number; // 0=Sun, 1=Mon, ..., 6=Sat
  start_time: string;  // HH:MM format
  end_time: string;    // HH:MM format
  is_active: boolean;
}

export interface CoachAvailabilityCreationAttributes
  extends Optional<CoachAvailabilityAttributes, 'id' | 'is_active'> {}

class CoachAvailability
  extends Model<CoachAvailabilityAttributes, CoachAvailabilityCreationAttributes>
  implements CoachAvailabilityAttributes
{
  public id!: string;
  public coach_id!: string;
  public day_of_week!: number;
  public start_time!: string;
  public end_time!: string;
  public is_active!: boolean;
}

CoachAvailability.init(
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
    day_of_week: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0, max: 6 },
    },
    start_time: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    end_time: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'coach_availabilities',
    timestamps: false,
  }
);

export default CoachAvailability;
