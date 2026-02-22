import OvaloProfile, { OvaloTier, OVALO_TIERS, TIER_THRESHOLDS } from '../models/OvaloProfile';
import XPTransaction, { XPSource, XP_VALUES } from '../models/XPTransaction';
import sequelize from '../config/sequelize';

export interface XPAwardResult {
  xp_awarded: number;
  total_xp: number;
  tier: OvaloTier;
  feather_level: number;
  tier_changed: boolean;
  previous_tier: OvaloTier;
  streak: number;
}

export function calculateTier(totalXP: number): OvaloTier {
  let tier: OvaloTier = 'rookie_nest';
  for (let i = OVALO_TIERS.length - 1; i >= 0; i--) {
    if (totalXP >= TIER_THRESHOLDS[OVALO_TIERS[i]]) {
      tier = OVALO_TIERS[i];
      break;
    }
  }
  return tier;
}

export function calculateFeatherLevel(totalXP: number, tier: OvaloTier): number {
  const tierIndex = OVALO_TIERS.indexOf(tier);
  const currentThreshold = TIER_THRESHOLDS[tier];
  const nextTier = OVALO_TIERS[tierIndex + 1];
  const nextThreshold = nextTier ? TIER_THRESHOLDS[nextTier] : currentThreshold + 50000;

  const progressInTier = totalXP - currentThreshold;
  const tierRange = nextThreshold - currentThreshold;
  const level = Math.floor((progressInTier / tierRange) * 10) + 1;

  return Math.max(1, Math.min(10, level));
}

export function xpToNextTier(totalXP: number, tier: OvaloTier): { next_tier: OvaloTier | null; xp_needed: number; progress_pct: number } {
  const tierIndex = OVALO_TIERS.indexOf(tier);
  const nextTier = OVALO_TIERS[tierIndex + 1] || null;
  if (!nextTier) return { next_tier: null, xp_needed: 0, progress_pct: 100 };

  const currentThreshold = TIER_THRESHOLDS[tier];
  const nextThreshold = TIER_THRESHOLDS[nextTier];
  const progressInTier = totalXP - currentThreshold;
  const tierRange = nextThreshold - currentThreshold;

  return {
    next_tier: nextTier,
    xp_needed: nextThreshold - totalXP,
    progress_pct: Math.min(100, Math.round((progressInTier / tierRange) * 100)),
  };
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function isYesterday(dateStr: string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateStr === yesterday.toISOString().split('T')[0];
}

async function getOrCreateProfile(userId: string): Promise<OvaloProfile> {
  let profile = await OvaloProfile.findOne({ where: { user_id: userId } });
  if (!profile) {
    profile = await OvaloProfile.create({ user_id: userId });
  }
  return profile;
}

export async function awardXP(
  userId: string,
  source: XPSource,
  referenceId?: string,
  customAmount?: number
): Promise<XPAwardResult> {
  const amount = customAmount ?? XP_VALUES[source];

  return sequelize.transaction(async (t) => {
    const profile = await getOrCreateProfile(userId);
    const previousTier = profile.tier;
    const today = getToday();

    await XPTransaction.create(
      { user_id: userId, amount, source, reference_id: referenceId || null },
      { transaction: t }
    );

    const newTotalXP = profile.total_xp + amount;
    const newTier = calculateTier(newTotalXP);
    const newFeatherLevel = calculateFeatherLevel(newTotalXP, newTier);

    let newStreak = profile.current_streak;
    let newLongestStreak = profile.longest_streak;
    if (profile.last_active_date !== today) {
      if (profile.last_active_date && isYesterday(profile.last_active_date)) {
        newStreak = profile.current_streak + 1;
      } else if (profile.last_active_date !== today) {
        newStreak = 1;
      }
      newLongestStreak = Math.max(newLongestStreak, newStreak);
    }

    await profile.update(
      {
        total_xp: newTotalXP,
        tier: newTier,
        feather_level: newFeatherLevel,
        current_streak: newStreak,
        longest_streak: newLongestStreak,
        last_active_date: today,
      },
      { transaction: t }
    );

    return {
      xp_awarded: amount,
      total_xp: newTotalXP,
      tier: newTier,
      feather_level: newFeatherLevel,
      tier_changed: newTier !== previousTier,
      previous_tier: previousTier,
      streak: newStreak,
    };
  });
}

export async function getProfile(userId: string) {
  const profile = await getOrCreateProfile(userId);
  const progression = xpToNextTier(profile.total_xp, profile.tier);
  return { ...profile.toJSON(), ...progression };
}

export async function getXPHistory(userId: string, limit = 20, offset = 0) {
  const { rows, count } = await XPTransaction.findAndCountAll({
    where: { user_id: userId },
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });
  return { transactions: rows, total: count };
}
