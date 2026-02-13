import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';
import type User from './User';

export interface UserMatchAttributes {
  id: string;
  user1_id: string;
  user2_id: string;
  matched_at: Date;
  is_active: boolean;
  created_at: Date;
}

export interface UserMatchCreationAttributes
  extends Optional<UserMatchAttributes, 'id' | 'matched_at' | 'is_active' | 'created_at'> {}

class UserMatch
  extends Model<UserMatchAttributes, UserMatchCreationAttributes>
  implements UserMatchAttributes {
  public id!: string;
  public user1_id!: string;
  public user2_id!: string;
  public matched_at!: Date;
  public is_active!: boolean;
  public created_at!: Date;

  // Association virtual fields (populated via include)
  public User1?: User;
  public User2?: User;
}

UserMatch.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    user1_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    user2_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    matched_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'user_matches',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

export default UserMatch;
