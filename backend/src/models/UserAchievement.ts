import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

export interface UserAchievementAttributes {
  id: string;
  user_id: string;
  achievement_id: string;
  progress: number;
  unlocked_at?: Date | null;
  created_at: Date;
}

export interface UserAchievementCreationAttributes
  extends Optional<UserAchievementAttributes, 'id' | 'progress' | 'unlocked_at' | 'created_at'> {}

class UserAchievement
  extends Model<UserAchievementAttributes, UserAchievementCreationAttributes>
  implements UserAchievementAttributes
{
  public id!: string;
  public user_id!: string;
  public achievement_id!: string;
  public progress!: number;
  public unlocked_at!: Date | null;
  public created_at!: Date;
}

UserAchievement.init(
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    achievement_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'achievements', key: 'id' },
      onDelete: 'CASCADE',
    },
    progress: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    unlocked_at: { type: DataTypes.DATE, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, tableName: 'user_achievements', timestamps: true, createdAt: 'created_at', updatedAt: false }
);

export default UserAchievement;
