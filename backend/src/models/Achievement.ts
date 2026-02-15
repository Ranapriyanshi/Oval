import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

export interface AchievementAttributes {
  id: string;
  key: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  criteria_type?: string | null;
  criteria_value?: number | null;
  created_at: Date;
}

export interface AchievementCreationAttributes
  extends Optional<AchievementAttributes, 'id' | 'description' | 'icon' | 'criteria_type' | 'criteria_value' | 'created_at'> {}

class Achievement extends Model<AchievementAttributes, AchievementCreationAttributes> implements AchievementAttributes {
  public id!: string;
  public key!: string;
  public name!: string;
  public description!: string | null;
  public icon!: string | null;
  public criteria_type!: string | null;
  public criteria_value!: number | null;
  public created_at!: Date;
}

Achievement.init(
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    key: { type: DataTypes.STRING(80), allowNull: false, unique: true },
    name: { type: DataTypes.STRING(120), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    icon: { type: DataTypes.STRING(50), allowNull: true },
    criteria_type: { type: DataTypes.STRING(50), allowNull: true },
    criteria_value: { type: DataTypes.INTEGER, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, tableName: 'achievements', timestamps: true, createdAt: 'created_at', updatedAt: false }
);

export default Achievement;
