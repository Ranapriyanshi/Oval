import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

export interface VenueRatingAttributes {
  id: string;
  venue_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: Date;
}

export interface VenueRatingCreationAttributes
  extends Optional<VenueRatingAttributes, 'id' | 'comment' | 'created_at'> {}

class VenueRating
  extends Model<VenueRatingAttributes, VenueRatingCreationAttributes>
  implements VenueRatingAttributes {
  public id!: string;
  public venue_id!: string;
  public user_id!: string;
  public rating!: number;
  public comment!: string | null;
  public created_at!: Date;
}

VenueRating.init(
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
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'venue_ratings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

export default VenueRating;
