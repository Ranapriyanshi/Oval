import React from 'react';
import { View, Image, StyleSheet, ImageSourcePropType } from 'react-native';
import type { OvaloTier } from '../../services/ovalo';

const TierBird1 = require('../../assets/Cartoon Blue Bird.png');
const TierBird2 = require('../../assets/Cartoonish Blue Bird.png');
const TierBird3 = require('../../assets/Colorful Bird Figurine.png');
const TierBird4 = require('../../assets/Colorful Bird Figurine (1).png');
const TierBird5 = require('../../assets/Colorful Clay Character.png');

const TIER_ASSETS: Record<OvaloTier, ImageSourcePropType> = {
  rookie_nest: TierBird1,
  community_flyer: TierBird2,
  court_commander: TierBird3,
  elite_wing: TierBird4,
  legend_of_the_oval: TierBird5,
};

const TIER_GLOW_COLORS: Record<OvaloTier, string> = {
  rookie_nest: '#C084FC',
  community_flyer: '#A855F7',
  court_commander: '#9333EA',
  elite_wing: '#7E22CE',
  legend_of_the_oval: '#6B21A8',
};

interface OvaloCharacterProps {
  tier: OvaloTier;
  featherLevel?: number;
  size?: number;
  showGlow?: boolean;
}

const OvaloCharacter: React.FC<OvaloCharacterProps> = ({
  tier,
  featherLevel = 1,
  size = 160,
  showGlow = true,
}) => {
  const glowColor = TIER_GLOW_COLORS[tier];
  const glowOpacity = 0.15 + (featherLevel / 10) * 0.35;
  const glowSize = size * 1.3;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {showGlow && (
        <View
          style={[
            styles.glow,
            {
              width: glowSize,
              height: glowSize,
              borderRadius: glowSize / 2,
              backgroundColor: glowColor,
              opacity: glowOpacity,
              top: -(glowSize - size) / 2,
              left: -(glowSize - size) / 2,
            },
          ]}
        />
      )}
      <Image
        source={TIER_ASSETS[tier]}
        style={[styles.bird, { width: size * 0.85, height: size * 0.85 }]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
  },
  bird: {},
});

export default OvaloCharacter;
