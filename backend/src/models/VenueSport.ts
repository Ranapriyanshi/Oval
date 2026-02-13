import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

export interface VenueSportAttributes {
  id: string;
  venue_id: string;
  sport_name: string;
  hourly_rate_cents: number;
  created_at: Date;
}

export interface VenueSportCreationAttributes
  extends Optional<VenueSportAttributes, 'id' | 'created_at'> {}

class VenueSport extends Model<VenueSportAttributes, VenueSportCreationAttributes>
  implements VenueSportAttributes {
  public id!: string;
  public venue_id!: string;
  public sport_name!: string;
  public hourly_rate_cents!: number;
  public created_at!: Date;
}

VenueSport.init(
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
    sport_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    hourly_rate_cents: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'venue_sports',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

export default VenueSport;
