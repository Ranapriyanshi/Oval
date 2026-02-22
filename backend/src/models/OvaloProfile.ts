import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

export const OVALO_TIERS = [
  'rookie_nest',
  'community_flyer',
  'court_commander',
  'elite_wing',
  'legend_of_the_oval',
] as const;

export type OvaloTier = (typeof OVALO_TIERS)[number];

export const TIER_THRESHOLDS: Record<OvaloTier, number> = {
  rookie_nest: 0,
  community_flyer: 1000,
  court_commander: 5000,
  elite_wing: 15000,
  legend_of_the_oval: 50000,
};

export const TIER_LABELS: Record<OvaloTier, string> = {
  rookie_nest: 'Rookie Nest',
  community_flyer: 'Community Flyer',
  court_commander: 'Court Commander',
  elite_wing: 'Elite Wing',
  legend_of_the_oval: 'Legend of the Oval',
};

export interface OvaloProfileAttributes {
  id: string;
  user_id: string;
  total_xp: number;
  tier: OvaloTier;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  feather_level: number;
  unlocked_embellishments: string[];
  created_at: Date;
  updated_at: Date;
}

export interface OvaloProfileCreationAttributes
  extends Optional<
    OvaloProfileAttributes,
    'id' | 'total_xp' | 'tier' | 'current_streak' | 'longest_streak' | 'last_active_date' | 'feather_level' | 'unlocked_embellishments' | 'created_at' | 'updated_at'
  > {}

class OvaloProfile extends Model<OvaloProfileAttributes, OvaloProfileCreationAttributes> implements OvaloProfileAttributes {
  public id!: string;
  public user_id!: string;
  public total_xp!: number;
  public tier!: OvaloTier;
  public current_streak!: number;
  public longest_streak!: number;
  public last_active_date!: string | null;
  public feather_level!: number;
  public unlocked_embellishments!: string[];
  public created_at!: Date;
  public updated_at!: Date;
}

OvaloProfile.init(
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    total_xp: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    tier: {
      type: DataTypes.ENUM(...OVALO_TIERS),
      allowNull: false,
      defaultValue: 'rookie_nest',
    },
    current_streak: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    longest_streak: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    last_active_date: { type: DataTypes.DATEONLY, allowNull: true },
    feather_level: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    unlocked_embellishments: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: 'ovalo_profiles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default OvaloProfile;
