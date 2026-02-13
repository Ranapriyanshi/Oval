import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

export interface UserProfilePhotoAttributes {
  id: string;
  user_id: string;
  url: string;
  sort_order: number;
  is_primary: boolean;
  created_at: Date;
}

export interface UserProfilePhotoCreationAttributes
  extends Optional<UserProfilePhotoAttributes, 'id' | 'sort_order' | 'is_primary' | 'created_at'> {}

class UserProfilePhoto
  extends Model<UserProfilePhotoAttributes, UserProfilePhotoCreationAttributes>
  implements UserProfilePhotoAttributes {
  public id!: string;
  public user_id!: string;
  public url!: string;
  public sort_order!: number;
  public is_primary!: boolean;
  public created_at!: Date;
}

UserProfilePhoto.init(
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
    url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'user_profile_photos',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

export default UserProfilePhoto;
