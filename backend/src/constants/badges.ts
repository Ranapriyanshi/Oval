import type { OvaloTier } from '../models/OvaloProfile';

export const BADGE_KEYS = [
  'shuttlecock',
  'cricket_stripe',
  'football_badge',
  'gold_crest',
  'golden_wing',
  'tennis_ace',
] as const;

export type BadgeKey = (typeof BADGE_KEYS)[number];

export interface BadgeDefinition {
  key: BadgeKey;
  name: string;
  description: string;
  emoji: string;
  unlockTier: OvaloTier;
}

export const BADGE_CATALOG: Record<BadgeKey, BadgeDefinition> = {
  shuttlecock: {
    key: 'shuttlecock',
    name: 'Shuttlecock Feather',
    description: 'Earned by reaching Community Flyer',
    emoji: '🏸',
    unlockTier: 'community_flyer',
  },
  cricket_stripe: {
    key: 'cricket_stripe',
    name: 'Cricket Stripe',
    description: 'Earned by reaching Court Commander',
    emoji: '🏏',
    unlockTier: 'court_commander',
  },
  football_badge: {
    key: 'football_badge',
    name: 'Football Badge',
    description: 'Earned by reaching Court Commander',
    emoji: '⚽',
    unlockTier: 'court_commander',
  },
  gold_crest: {
    key: 'gold_crest',
    name: 'Golden Crest',
    description: 'Earned by reaching Elite Wing',
    emoji: '👑',
    unlockTier: 'elite_wing',
  },
  golden_wing: {
    key: 'golden_wing',
    name: 'Golden Wing Accent',
    description: 'Earned by reaching Elite Wing',
    emoji: '🦅',
    unlockTier: 'elite_wing',
  },
  tennis_ace: {
    key: 'tennis_ace',
    name: 'Tennis Ace',
    description: 'Earned by reaching Legend of the Oval',
    emoji: '🎾',
    unlockTier: 'legend_of_the_oval',
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
