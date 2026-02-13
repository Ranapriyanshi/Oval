import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

export interface VenueScheduleAttributes {
  id: string;
  venue_id: string;
  day_of_week: number;
  open_time: string;
  close_time: string;
  created_at: Date;
}

export interface VenueScheduleCreationAttributes
  extends Optional<VenueScheduleAttributes, 'id' | 'created_at'> {}

class VenueSchedule
  extends Model<VenueScheduleAttributes, VenueScheduleCreationAttributes>
  implements VenueScheduleAttributes {
  public id!: string;
  public venue_id!: string;
  public day_of_week!: number;
  public open_time!: string;
  public close_time!: string;
  public created_at!: Date;
}

VenueSchedule.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    venue_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'venues', key: 'id' },
      onDelete: 'CASCADE',
    },
    day_of_week: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '0=Sunday, 1=Monday, ... 6=Saturday',
    },
    open_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    close_time: {
      type: DataTypes.TIME,
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
    tableName: 'venue_schedules',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

export default VenueSchedule;
