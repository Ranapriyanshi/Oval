import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

export interface EventRegistrationAttributes {
  id: string;
  event_id: string;
  user_id: string;
  status: 'registered' | 'waitlist' | 'cancelled';
  registered_at: Date;
}

export interface EventRegistrationCreationAttributes
  extends Optional<EventRegistrationAttributes, 'id' | 'registered_at'> {}

class EventRegistration
  extends Model<EventRegistrationAttributes, EventRegistrationCreationAttributes>
  implements EventRegistrationAttributes
{
  public id!: string;
  public event_id!: string;
  public user_id!: string;
  public status!: 'registered' | 'waitlist' | 'cancelled';
  public registered_at!: Date;
}

EventRegistration.init(
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    event_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'events', key: 'id' },
      onDelete: 'CASCADE',
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    status: {
      type: DataTypes.ENUM('registered', 'waitlist', 'cancelled'),
      allowNull: false,
      defaultValue: 'registered',
    },
    registered_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, tableName: 'event_registrations', timestamps: false }
);

export default EventRegistration;
