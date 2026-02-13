import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

export interface VenueImageAttributes {
  id: string;
  venue_id: string;
  url: string;
  sort_order: number;
  created_at: Date;
}

export interface VenueImageCreationAttributes
  extends Optional<VenueImageAttributes, 'id' | 'sort_order' | 'created_at'> {}

class VenueImage extends Model<VenueImageAttributes, VenueImageCreationAttributes>
  implements VenueImageAttributes {
  public id!: string;
  public venue_id!: string;
  public url!: string;
  public sort_order!: number;
  public created_at!: Date;
}

VenueImage.init(
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
    url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    sort_order: {
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
    tableName: 'venue_images',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

export default VenueImage;
