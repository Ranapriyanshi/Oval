import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

export interface UserAvailabilityAttributes {
  id: string;
  user_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  created_at: Date;
}

export interface UserAvailabilityCreationAttributes
  extends Optional<UserAvailabilityAttributes, 'id' | 'created_at'> {}

class UserAvailability
  extends Model<UserAvailabilityAttributes, UserAvailabilityCreationAttributes>
  implements UserAvailabilityAttributes {
  public id!: string;
  public user_id!: string;
  public day_of_week!: number;
  public start_time!: string;
  public end_time!: string;
  public created_at!: Date;
}

UserAvailability.init(
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
    day_of_week: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '0=Sunday, 1=Monday, ... 6=Saturday',
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    end_time: {
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
    tableName: 'user_availability',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

export default UserAvailability;
