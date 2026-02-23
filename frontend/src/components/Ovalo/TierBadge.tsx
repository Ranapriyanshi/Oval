import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { borderRadius, fontSize, fontWeight, fontFamily } from '../../theme';
import type { OvaloTier } from '../../services/ovalo';

const TIER_SHORT: Record<OvaloTier, string> = {
  rookie_nest: 'RN',
  community_flyer: 'CF',
  court_commander: 'CC',
  elite_wing: 'EW',
  legend_of_the_oval: 'LO',
};

const TIER_COLORS: Record<OvaloTier, { bg: string; text: string }> = {
  rookie_nest: { bg: '#EDE9FE', text: '#7C3AED' },
  community_flyer: { bg: '#DDD6FE', text: '#6D28D9' },
  court_commander: { bg: '#C4B5FD', text: '#5B21B6' },
  elite_wing: { bg: '#A78BFA', text: '#FFFFFF' },
  legend_of_the_oval: { bg: '#7C3AED', text: '#FACC15' },
};

interface TierBadgeProps {
  tier: OvaloTier;
  size?: 'sm' | 'md';
}

const TierBadge: React.FC<TierBadgeProps> = ({ tier, size = 'sm' }) => {
  const colors = TIER_COLORS[tier];
  const isMd = size === 'md';
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }, isMd && styles.badgeMd]}>
      <Text style={[styles.text, { color: colors.text }, isMd && styles.textMd]}>
        {TIER_SHORT[tier]}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: borderRadius.sm,
    marginLeft: 4,
  },
  badgeMd: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  text: {
    fontFamily: fontFamily.roundedBold,
    fontSize: fontSize.xs - 1,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
  },
  textMd: {
    fontSize: fontSize.xs,
  },
});

export default TierBadge;
