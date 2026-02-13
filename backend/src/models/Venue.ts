import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

export interface VenueAttributes {
  id: string;
  name: string;
  address: string;
  city: string;
  state_region: string | null;
  country_code: string;
  latitude: string | null;
  longitude: string | null;
  description: string | null;
  amenities: string[] | null;
  currency: string;
  created_at: Date;
  updated_at: Date;
}

export interface VenueCreationAttributes
  extends Optional<
    VenueAttributes,
    | 'id'
    | 'state_region'
    | 'latitude'
    | 'longitude'
    | 'description'
    | 'amenities'
    | 'created_at'
    | 'updated_at'
  > {}

class Venue extends Model<VenueAttributes, VenueCreationAttributes> implements VenueAttributes {
  public id!: string;
  public name!: string;
  public address!: string;
  public city!: string;
  public state_region!: string | null;
  public country_code!: string;
  public latitude!: string | null;
  public longitude!: string | null;
  public description!: string | null;
  public amenities!: string[] | null;
  public currency!: string;
  public created_at!: Date;
  public updated_at!: Date;
}

Venue.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    state_region: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    country_code: {
      type: DataTypes.STRING(2),
      allowNull: false,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
      get() {
        const value = this.getDataValue('latitude');
        return value != null ? String(value) : null;
      },
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
      get() {
        const value = this.getDataValue('longitude');
        return value != null ? String(value) : null;
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    amenities: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'AUD',
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
    tableName: 'venues',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Venue;
