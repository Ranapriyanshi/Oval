import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

export interface UserSwipeAttributes {
  id: string;
  swiper_id: string;
  swiped_id: string;
  direction: 'left' | 'right';
  created_at: Date;
}

export interface UserSwipeCreationAttributes
  extends Optional<UserSwipeAttributes, 'id' | 'created_at'> {}

class UserSwipe
  extends Model<UserSwipeAttributes, UserSwipeCreationAttributes>
  implements UserSwipeAttributes {
  public id!: string;
  public swiper_id!: string;
  public swiped_id!: string;
  public direction!: 'left' | 'right';
  public created_at!: Date;
}

UserSwipe.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    swiper_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    swiped_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    direction: {
      type: DataTypes.ENUM('left', 'right'),
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
    tableName: 'user_swipes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

export default UserSwipe;
