import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Image } from 'react-native';
import { spacing, borderRadius, fontSize, fontWeight, fontFamily } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import type { XPAwardResult } from '../../services/ovalo';
import { TIER_LABELS } from '../../services/ovalo';
import OvaloCharacter from './OvaloCharacter';

const CoinIcon = require('../../assets/gold-coin-icon-isolated-3d-render-illustration.png');

interface XPFeedbackOverlayProps {
  result: XPAwardResult;
  visible: boolean;
  onDismiss: () => void;
}

const XPFeedbackOverlay: React.FC<XPFeedbackOverlayProps> = ({ result, visible, onDismiss }) => {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const xpSlide = useRef(new Animated.Value(30)).current;
  const coinSpin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.6);
      xpSlide.setValue(30);
      coinSpin.setValue(0);

      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 120, useNativeDriver: true }),
        Animated.timing(xpSlide, { toValue: 0, duration: 400, delay: 200, easing: Easing.out(Easing.back(1.4)), useNativeDriver: true }),
        Animated.timing(coinSpin, { toValue: 1, duration: 600, delay: 100, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => onDismiss());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  const coinRotate = coinSpin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <Animated.View style={[styles.card, { backgroundColor: colors.surface, transform: [{ scale: scaleAnim }] }]}>
        <OvaloCharacter tier={result.tier} featherLevel={result.feather_level} size={100} />

        <View style={styles.xpRow}>
          <Animated.View style={{ transform: [{ rotateY: coinRotate }] }}>
            <Image source={CoinIcon} style={styles.coinIcon} resizeMode="contain" />
          </Animated.View>
          <Animated.Text
            style={[styles.xpText, { color: colors.primary, transform: [{ translateY: xpSlide }] }]}
          >
            +{result.xp_awarded} XP
          </Animated.Text>
        </View>

        <Text style={[styles.totalXP, { color: colors.textSecondary }]}>
          Total: {result.total_xp.toLocaleString()} XP
        </Text>

        {result.tier_changed && (
          <View style={[styles.tierUpBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.tierUpText}>
              TIER UP! {TIER_LABELS[result.tier]}
            </Text>
          </View>
        )}

        {result.streak > 1 && (
          <Text style={[styles.streakText, { color: colors.textSecondary }]}>
            🔥 {result.streak}-day streak!
          </Text>
        )}
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  card: {
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    minWidth: 260,
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
      elevation: 8,
    },
  },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  coinIcon: {
    width: 36,
    height: 36,
  },
  xpText: {
    fontFamily: fontFamily.roundedBold,
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
  },
  totalXP: {
    fontFamily: fontFamily.roundedSemibold,
    fontSize: fontSize.base,
    marginTop: spacing.xs,
  },
  tierUpBadge: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
  },
  tierUpText: {
    fontFamily: fontFamily.roundedBold,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  streakText: {
    fontFamily: fontFamily.roundedSemibold,
    fontSize: fontSize.base,
    marginTop: spacing.sm,
  },
});

export default XPFeedbackOverlay;
