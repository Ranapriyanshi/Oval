import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Image,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { spacing, borderRadius, fontSize, fontWeight, fontFamily, shadow } from '../../theme';
import {
  ovaloApi,
  OvaloProfileResponse,
  XPTransactionItem,
  XP_SOURCE_LABELS,
  XP_SOURCE_ICONS,
  TIER_LABELS,
  OvaloTier,
} from '../../services/ovalo';
import OvaloCharacter from '../../components/Ovalo/OvaloCharacter';

const CoinIcon = require('../../assets/gold-coin-icon-isolated-3d-render-illustration.png');

const TIER_ORDER: OvaloTier[] = [
  'rookie_nest',
  'community_flyer',
  'court_commander',
  'elite_wing',
  'legend_of_the_oval',
];

const TIER_XP_THRESHOLDS: Record<OvaloTier, number> = {
  rookie_nest: 0,
  community_flyer: 1000,
  court_commander: 5000,
  elite_wing: 15000,
  legend_of_the_oval: 50000,
};

const CompanionMonster = require('../../assets/Friendly Clay Monster.png');
const CompanionAlien = require('../../assets/Playful Clay Alien.png');
const CompanionRobot = require('../../assets/Pastel Robot Character.png');
const CompanionCat = require('../../assets/Charming Orange Clay Cat Figurine.png');
const CompanionWitch = require('../../assets/Cheerful Clay Witch.png');
const CompanionBalloon = require('../../assets/Whimsical Balloon Character.png');

const COMPANION_ASSETS = [
  { image: CompanionMonster, name: 'Bloop', unlockTier: 'rookie_nest' as OvaloTier },
  { image: CompanionCat, name: 'Whiskers', unlockTier: 'community_flyer' as OvaloTier },
  { image: CompanionRobot, name: 'Sparky', unlockTier: 'court_commander' as OvaloTier },
  { image: CompanionAlien, name: 'Ziggy', unlockTier: 'elite_wing' as OvaloTier },
  { image: CompanionWitch, name: 'Mystica', unlockTier: 'elite_wing' as OvaloTier },
  { image: CompanionBalloon, name: 'Puffin', unlockTier: 'legend_of_the_oval' as OvaloTier },
];

const SHADOW_HEIGHT = 4;

const OvaloScreen = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [profile, setProfile] = useState<OvaloProfileResponse | null>(null);
  const [history, setHistory] = useState<XPTransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [profileRes, historyRes] = await Promise.all([
        ovaloApi.getProfile(),
        ovaloApi.getHistory({ limit: 10 }),
      ]);
      setProfile(profileRes);
      setHistory(historyRes.transactions);
    } catch (e) {
      console.error('Load Ovalo error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const tierIndex = profile ? TIER_ORDER.indexOf(profile.tier) : 0;

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (loading || !profile) {
    return (
      <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textTertiary }]}>Loading your Ovalo...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Hero section with Ovalo character */}
        <View style={[styles.heroSection, { backgroundColor: colors.primary }]}>
          <Text style={styles.heroTitle}>YOUR OVALO</Text>
          <OvaloCharacter
            tier={profile.tier}
            featherLevel={profile.feather_level}
            size={180}
            showGlow
          />
          <Text style={styles.heroTierLabel}>{profile.tier_label}</Text>
          <Text style={styles.heroFeatherLevel}>Feather Level {profile.feather_level}</Text>
        </View>

        <View style={styles.content}>
          {/* XP + Progress Card */}
          <View style={styles.xpCardOuter}>
            <View style={[styles.xpCardShadow, { backgroundColor: '#5a05a8', borderRadius: borderRadius.lg }]} />
            <View style={[styles.xpCard, { backgroundColor: colors.primary }]}>
              <View style={styles.xpTopRow}>
                <Image source={CoinIcon} style={styles.coinIconLg} resizeMode="contain" />
                <View>
                  <Text style={styles.xpAmount}>{profile.total_xp.toLocaleString()} XP</Text>
                  <Text style={styles.xpLabel}>TOTAL EXPERIENCE</Text>
                </View>
              </View>

              {profile.next_tier && (
                <View style={styles.progressSection}>
                  <View style={styles.progressLabelRow}>
                    <Text style={styles.progressLabel}>{profile.tier_label}</Text>
                    <Text style={styles.progressLabel}>{TIER_LABELS[profile.next_tier]}</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${profile.progress_pct}%` }]} />
                  </View>
                  <Text style={styles.progressXPNeeded}>
                    {profile.xp_needed.toLocaleString()} XP to next tier
                  </Text>
                </View>
              )}
              {!profile.next_tier && (
                <Text style={styles.maxTierText}>Maximum tier reached!</Text>
              )}
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: colors.surface }, shadow.sm]}>
              <Text style={styles.statEmoji}>🔥</Text>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>{profile.current_streak}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>STREAK</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.surface }, shadow.sm]}>
              <Text style={styles.statEmoji}>🪶</Text>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>{profile.feather_level}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>FEATHER</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.surface }, shadow.sm]}>
              <Text style={styles.statEmoji}>🏅</Text>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>{profile.longest_streak}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>BEST STREAK</Text>
            </View>
          </View>

          {/* League Progress */}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>LEAGUE PROGRESSION</Text>
          <View style={[styles.leagueCard, { backgroundColor: colors.surface }, shadow.sm]}>
            {TIER_ORDER.map((t, i) => {
              const isActive = i === tierIndex;
              const isUnlocked = i <= tierIndex;
              return (
                <View key={t} style={styles.leagueRow}>
                  <View
                    style={[
                      styles.leagueDot,
                      {
                        backgroundColor: isUnlocked ? colors.primary : colors.chipBackground,
                        borderColor: isActive ? colors.primary : 'transparent',
                        borderWidth: isActive ? 2 : 0,
                      },
                    ]}
                  >
                    {isUnlocked && <Text style={styles.leagueDotCheck}>✓</Text>}
                  </View>
                  {i < TIER_ORDER.length - 1 && (
                    <View style={[styles.leagueLine, { backgroundColor: isUnlocked ? colors.primary : colors.chipBackground }]} />
                  )}
                  <View style={styles.leagueTextBlock}>
                    <Text
                      style={[
                        styles.leagueName,
                        { color: isActive ? colors.primary : isUnlocked ? colors.textPrimary : colors.textTertiary },
                        isActive && { fontWeight: fontWeight.bold },
                      ]}
                    >
                      {TIER_LABELS[t]}
                    </Text>
                    <Text style={[styles.leagueXP, { color: colors.textTertiary }]}>
                      {TIER_XP_THRESHOLDS[t].toLocaleString()} XP
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Companions Collection */}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>COMPANIONS</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.companionScroll}>
            {COMPANION_ASSETS.map((c, i) => {
              const unlocked = tierIndex >= TIER_ORDER.indexOf(c.unlockTier);
              return (
                <View
                  key={i}
                  style={[
                    styles.companionCard,
                    { backgroundColor: colors.surface, opacity: unlocked ? 1 : 0.4 },
                    shadow.sm,
                  ]}
                >
                  <Image source={c.image} style={styles.companionImage} resizeMode="contain" />
                  <Text style={[styles.companionName, { color: colors.textPrimary }]}>
                    {unlocked ? c.name : '???'}
                  </Text>
                  {!unlocked && (
                    <Text style={[styles.companionLock, { color: colors.textTertiary }]}>
                      {TIER_LABELS[c.unlockTier]}
                    </Text>
                  )}
                </View>
              );
            })}
          </ScrollView>

          {/* Recent XP Activity */}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>RECENT XP</Text>
          {history.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.surface }, shadow.sm]}>
              <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
                Start playing to earn XP and evolve your Ovalo!
              </Text>
            </View>
          ) : (
            <View style={[styles.historyCard, { backgroundColor: colors.surface }, shadow.sm]}>
              {history.map((tx, i) => {
                const isAlt = i % 2 === 1;
                return (
                  <View
                    key={tx.id}
                    style={[
                      styles.historyRow,
                      isAlt && { backgroundColor: colors.backgroundSecondary },
                      i < history.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.separator },
                    ]}
                  >
                    <Text style={styles.historyIcon}>{XP_SOURCE_ICONS[tx.source] || '⚡'}</Text>
                    <View style={styles.historyTextBlock}>
                      <Text style={[styles.historyLabel, { color: colors.textPrimary }]}>
                        {XP_SOURCE_LABELS[tx.source] || tx.source}
                      </Text>
                      <Text style={[styles.historyTime, { color: colors.textTertiary }]}>
                        {formatTimeAgo(tx.created_at)}
                      </Text>
                    </View>
                    <Text style={[styles.historyXP, { color: colors.primary }]}>+{tx.amount}</Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* CTA buttons */}
          <View style={styles.ctaRow}>
            <TouchableOpacity
              style={[styles.ctaButton, { backgroundColor: colors.primary }]}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Leaderboards')}
            >
              <Text style={styles.ctaText}>LEADERBOARDS</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.ctaButton, { backgroundColor: colors.accent }]}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Achievements')}
            >
              <Text style={styles.ctaText}>ACHIEVEMENTS</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 120 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontFamily: fontFamily.roundedSemibold, fontSize: fontSize.base },

  heroSection: {
    alignItems: 'center',
    paddingTop: spacing.xxxl + spacing.lg,
    paddingBottom: spacing.xxl,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  heroTitle: {
    fontFamily: fontFamily.roundedBold,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  heroTierLabel: {
    fontFamily: fontFamily.roundedBold,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: '#FFFFFF',
    marginTop: spacing.md,
  },
  heroFeatherLevel: {
    fontFamily: fontFamily.roundedSemibold,
    fontSize: fontSize.base,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.xs,
  },

  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },

  xpCardOuter: {
    position: 'relative',
    marginBottom: spacing.xl,
  },
  xpCardShadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
  },
  xpCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: SHADOW_HEIGHT,
    transform: [{ translateY: -SHADOW_HEIGHT }],
  },
  xpTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  coinIconLg: {
    width: 48,
    height: 48,
  },
  xpAmount: {
    fontFamily: fontFamily.roundedBold,
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    color: '#FFFFFF',
  },
  xpLabel: {
    fontFamily: fontFamily.roundedSemibold,
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
  },
  progressSection: {
    marginTop: spacing.lg,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  progressLabel: {
    fontFamily: fontFamily.roundedSemibold,
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.8)',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#FACC15',
  },
  progressXPNeeded: {
    fontFamily: fontFamily.roundedRegular,
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.7)',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  maxTierText: {
    fontFamily: fontFamily.roundedBold,
    fontSize: fontSize.base,
    color: '#FACC15',
    marginTop: spacing.md,
    textAlign: 'center',
  },

  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  statCard: {
    flex: 1,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
  },
  statEmoji: { fontSize: 24, marginBottom: spacing.xs },
  statValue: {
    fontFamily: fontFamily.roundedBold,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  statLabel: {
    fontFamily: fontFamily.roundedSemibold,
    fontSize: fontSize.xs,
    letterSpacing: 0.5,
    marginTop: spacing.xs,
  },

  sectionTitle: {
    fontFamily: fontFamily.roundedBold,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },

  leagueCard: {
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
  },
  leagueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    position: 'relative',
  },
  leagueDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  leagueDotCheck: {
    color: '#FFFFFF',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  leagueLine: {
    position: 'absolute',
    left: 13,
    top: 28,
    width: 2,
    height: spacing.md,
  },
  leagueTextBlock: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leagueName: {
    fontFamily: fontFamily.roundedSemibold,
    fontSize: fontSize.base,
  },
  leagueXP: {
    fontFamily: fontFamily.roundedRegular,
    fontSize: fontSize.sm,
  },

  companionScroll: {
    marginBottom: spacing.xxl,
  },
  companionCard: {
    width: 110,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginRight: spacing.md,
  },
  companionImage: {
    width: 70,
    height: 70,
    marginBottom: spacing.sm,
  },
  companionName: {
    fontFamily: fontFamily.roundedSemibold,
    fontSize: fontSize.sm,
  },
  companionLock: {
    fontFamily: fontFamily.roundedRegular,
    fontSize: fontSize.xs,
    marginTop: 2,
    textAlign: 'center',
  },

  historyCard: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginBottom: spacing.xxl,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  historyIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  historyTextBlock: {
    flex: 1,
  },
  historyLabel: {
    fontFamily: fontFamily.roundedSemibold,
    fontSize: fontSize.base,
  },
  historyTime: {
    fontFamily: fontFamily.roundedRegular,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  historyXP: {
    fontFamily: fontFamily.roundedBold,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },

  emptyCard: {
    borderRadius: borderRadius.md,
    padding: spacing.xxxl,
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  emptyText: {
    fontFamily: fontFamily.roundedRegular,
    fontSize: fontSize.base,
    textAlign: 'center',
  },

  ctaRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  ctaButton: {
    flex: 1,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  ctaText: {
    fontFamily: fontFamily.roundedBold,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});

export default OvaloScreen;
