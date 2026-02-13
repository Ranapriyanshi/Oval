import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

export interface UserSportsSkillAttributes {
  id: string;
  user_id: string;
  sport_name: string;
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  years_experience: number;
  play_style: 'casual' | 'competitive' | 'recreational' | 'training';
  created_at: Date;
  updated_at: Date;
}

export interface UserSportsSkillCreationAttributes
  extends Optional<UserSportsSkillAttributes, 'id' | 'years_experience' | 'created_at' | 'updated_at'> {}

class UserSportsSkill
  extends Model<UserSportsSkillAttributes, UserSportsSkillCreationAttributes>
  implements UserSportsSkillAttributes {
  public id!: string;
  public user_id!: string;
  public sport_name!: string;
  public skill_level!: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  public years_experience!: number;
  public play_style!: 'casual' | 'competitive' | 'recreational' | 'training';
  public created_at!: Date;
  public updated_at!: Date;
}

UserSportsSkill.init(
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
    sport_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    skill_level: {
      type: DataTypes.ENUM('beginner', 'intermediate', 'advanced', 'professional'),
      allowNull: false,
      defaultValue: 'intermediate',
    },
    years_experience: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    play_style: {
      type: DataTypes.ENUM('casual', 'competitive', 'recreational', 'training'),
      allowNull: false,
      defaultValue: 'casual',
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
    tableName: 'user_sports_skills',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default UserSportsSkill;
