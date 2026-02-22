import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

export const XP_SOURCES = [
  'booking_completed',
  'gametime_attended',
  'gametime_hosted',
  'streak_bonus',
  'new_sport',
  'friend_invited',
  'tournament_won',
  'training_session',
  'player_rated',
  'match_won',
  'event_joined',
  'coaching_completed',
] as const;

export type XPSource = (typeof XP_SOURCES)[number];

export const XP_VALUES: Record<XPSource, number> = {
  booking_completed: 50,
  gametime_attended: 100,
  gametime_hosted: 150,
  streak_bonus: 25,
  new_sport: 200,
  friend_invited: 100,
  tournament_won: 500,
  training_session: 80,
  player_rated: 20,
  match_won: 75,
  event_joined: 60,
  coaching_completed: 80,
};

export interface XPTransactionAttributes {
  id: string;
  user_id: string;
  amount: number;
  source: XPSource;
  reference_id: string | null;
  created_at: Date;
}

export interface XPTransactionCreationAttributes
  extends Optional<XPTransactionAttributes, 'id' | 'reference_id' | 'created_at'> {}

class XPTransaction extends Model<XPTransactionAttributes, XPTransactionCreationAttributes> implements XPTransactionAttributes {
  public id!: string;
  public user_id!: string;
  public amount!: number;
  public source!: XPSource;
  public reference_id!: string | null;
  public created_at!: Date;
}

XPTransaction.init(
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    amount: { type: DataTypes.INTEGER, allowNull: false },
    source: {
      type: DataTypes.ENUM(...XP_SOURCES),
      allowNull: false,
    },
    reference_id: { type: DataTypes.UUID, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: 'xp_transactions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

export default XPTransaction;
