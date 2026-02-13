import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

export interface BookingAttributes {
  id: string;
  venue_id: string;
  user_id: string;
  sport_name: string;
  start_time: Date;
  end_time: Date;
  total_cents: number;
  currency: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface BookingCreationAttributes
  extends Optional<
    BookingAttributes,
    'id' | 'total_cents' | 'currency' | 'status' | 'created_at' | 'updated_at'
  > {}

class Booking extends Model<BookingAttributes, BookingCreationAttributes> implements BookingAttributes {
  public id!: string;
  public venue_id!: string;
  public user_id!: string;
  public sport_name!: string;
  public start_time!: Date;
  public end_time!: Date;
  public total_cents!: number;
  public currency!: string;
  public status!: string;
  public created_at!: Date;
  public updated_at!: Date;
}

Booking.init(
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
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    sport_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    total_cents: {
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
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'confirmed',
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
    tableName: 'bookings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Booking;
