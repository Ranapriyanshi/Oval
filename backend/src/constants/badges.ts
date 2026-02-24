import type { OvaloTier } from '../models/OvaloProfile';

// Seasons are logical groupings like \"Summer 2026\", \"Festival 2026\", etc.
export type SeasonId = 'summer_2026' | 'festival_2026';

export const BADGE_KEYS = [
  'shuttlecock',
  'cricket_stripe',
  'football_badge',
  'gold_crest',
  'golden_wing',
  'tennis_ace',
  'summer_flare',
  'monsoon_feather',
] as const;

export type BadgeKey = (typeof BADGE_KEYS)[number];

export interface BadgeDefinition {
  key: BadgeKey;
  name: string;
  description: string;
  emoji: string;
  unlockTier: OvaloTier;
  // Seasonal metadata (optional for evergreen/core badges)
  season?: SeasonId;
  seasonLabel?: string;
  availableFrom?: string; // ISO date string
  availableTo?: string; // ISO date string
  rarity?: 'core' | 'seasonal' | 'legendary';
}

export const BADGE_CATALOG: Record<BadgeKey, BadgeDefinition> = {
  // Core / evergreen badges
  shuttlecock: {
    key: 'shuttlecock',
    name: 'Shuttlecock Feather',
    description: 'Earned by reaching Community Flyer',
    emoji: '🏸',
    unlockTier: 'community_flyer',
    rarity: 'core',
  },
  cricket_stripe: {
    key: 'cricket_stripe',
    name: 'Cricket Stripe',
    description: 'Earned by reaching Court Commander',
    emoji: '🏏',
    unlockTier: 'court_commander',
    rarity: 'core',
  },
  football_badge: {
    key: 'football_badge',
    name: 'Football Badge',
    description: 'Earned by reaching Court Commander',
    emoji: '⚽',
    unlockTier: 'court_commander',
    rarity: 'core',
  },
  gold_crest: {
    key: 'gold_crest',
    name: 'Golden Crest',
    description: 'Earned by reaching Elite Wing',
    emoji: '👑',
    unlockTier: 'elite_wing',
    rarity: 'core',
  },
  golden_wing: {
    key: 'golden_wing',
    name: 'Golden Wing Accent',
    description: 'Earned by reaching Elite Wing',
    emoji: '🦅',
    unlockTier: 'elite_wing',
    rarity: 'core',
  },
  tennis_ace: {
    key: 'tennis_ace',
    name: 'Tennis Ace',
    description: 'Earned by reaching Legend of the Oval',
    emoji: '🎾',
    unlockTier: 'legend_of_the_oval',
    rarity: 'core',
  },

  // Seasonal badges — limited-time feathers
  summer_flare: {
    key: 'summer_flare',
    name: 'Summer Flare Feather',
    description: 'Limited badge from the Summer Circuit 2026 season.',
    emoji: '🌞',
    unlockTier: 'community_flyer',
    rarity: 'seasonal',
    season: 'summer_2026',
    seasonLabel: 'Summer Circuit 2026',
    // Broad window for now so it shows as active in 2026
    availableFrom: '2026-01-01',
    availableTo: '2026-12-31',
  },
  monsoon_feather: {
    key: 'monsoon_feather',
    name: 'Monsoon Feather',
    description: 'Stormy violet feather from the Festival of Feathers 2026.',
    emoji: '🌧️',
    unlockTier: 'court_commander',
    rarity: 'seasonal',
    season: 'festival_2026',
    seasonLabel: 'Festival of Feathers 2026',
    availableFrom: '2026-07-01',
    availableTo: '2026-09-30',
  },
};

const TIER_ORDER: OvaloTier[] = [
  'rookie_nest',
  'community_flyer',
  'court_commander',
  'elite_wing',
  'legend_of_the_oval',
];

export function isBadgeUnlocked(badgeKey: BadgeKey, userTier: OvaloTier): boolean {
  const def = BADGE_CATALOG[badgeKey];
  const defIndex = TIER_ORDER.indexOf(def.unlockTier);
  const userIndex = TIER_ORDER.indexOf(userTier);
  return userIndex >= defIndex;
}

export function isBadgeCurrentlyAvailable(def: BadgeDefinition, now: Date = new Date()): boolean {
  // Core / evergreen badges are always available
  if (!def.season && !def.availableFrom && !def.availableTo) {
    return true;
  }

  const ts = now.getTime();
  if (def.availableFrom) {
    const from = new Date(def.availableFrom).getTime();
    if (ts < from) return false;
  }
  if (def.availableTo) {
    const to = new Date(def.availableTo).getTime();
    if (ts > to) return false;
  }
  return true;
}
