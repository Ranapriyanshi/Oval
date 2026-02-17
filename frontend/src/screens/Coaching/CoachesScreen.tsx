import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import coachingApi, { CoachItem } from '../../services/coaching';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, fontSize, fontWeight, shadow } from '../../theme';

const SPORT_FILTERS = ['All', 'Tennis', 'Cricket', 'Swimming', 'Basketball', 'Fitness', 'Soccer', 'Running'];

const SPORT_EMOJIS: Record<string, string> = {
  Tennis: '🎾', Cricket: '🏏', Swimming: '🏊', Basketball: '🏀',
  Fitness: '💪', Soccer: '⚽', Running: '🏃', 'Water Polo': '🤽',
  Batting: '🏏', Bowling: '🎳', Fielding: '🏏',
  'Team Strategy': '📋', 'Mental Coaching': '🧠',
};

const CoachesScreen = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const [coaches, setCoaches] = useState<CoachItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSport, setSelectedSport] = useState('All');

  const loadCoaches = useCallback(async () => {
    try {
      const params: any = {};
      if (selectedSport !== 'All') params.sport = selectedSport;
      const data = await coachingApi.getCoaches(params);
      setCoaches(data.coaches);
    } catch (error) {
      console.error('Failed to load coaches:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedSport]);

  useEffect(() => {
    setLoading(true);
    loadCoaches();
  }, [loadCoaches]);

  const onRefresh = () => {
    setRefreshing(true);
    loadCoaches();
  };

  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    let stars = '';
    for (let i = 0; i < full; i++) stars += '★';
    if (half) stars += '½';
    return stars;
  };

  const renderCoach = ({ item, index }: { item: CoachItem; index: number }) => {
    const initial = item.User?.name?.charAt(0)?.toUpperCase() || '?';
    const isAlt = index % 2 === 1;
    const bg = isAlt ? colors.cardAltBackground : colors.cardBackground;
    const border = isAlt ? colors.cardAltBorder : colors.cardBorder;
    const t1 = isAlt ? colors.cardAltTextPrimary : colors.textPrimary;
    const t2 = isAlt ? colors.cardAltTextSecondary : colors.textSecondary;
    const t3 = isAlt ? colors.cardAltTextSecondary : colors.textTertiary;
    const chipBg = isAlt ? colors.cardAltChipBackground : colors.chipBackground;
    const chipTxt = isAlt ? colors.cardAltChipText : colors.chipText;

    return (
      <TouchableOpacity
        style={[styles.coachCard, { backgroundColor: bg, borderColor: border }]}
        onPress={() => navigation.navigate('CoachProfile', { coachId: item.id })}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.avatarRow}>
            <View style={[styles.avatar, { backgroundColor: isAlt ? 'rgba(255,255,255,0.25)' : colors.primaryLight }]}>
              <Text style={[styles.avatarText, { color: isAlt ? colors.textInverse : colors.primary }]}>{initial}</Text>
            </View>
            <View style={styles.nameBlock}>
              <View style={styles.nameRow}>
                <Text style={[styles.coachName, { color: t1 }]} numberOfLines={1}>{item.User?.name}</Text>
                {item.is_verified && <Text style={[styles.verifiedBadge, { color: colors.textInverse, backgroundColor: colors.accentGreen }]}>✓</Text>}
              </View>
              <Text style={[styles.coachCity, { color: t2 }]}>📍 {item.city || item.User?.city || 'Unknown'}</Text>
            </View>
          </View>
          <View style={styles.rateBlock}>
            <Text style={[styles.rateAmount, { color: isAlt ? colors.textInverse : colors.primary }]}>${Number(item.hourly_rate).toFixed(0)}</Text>
            <Text style={[styles.rateLabel, { color: t3 }]}>/hr</Text>
          </View>
        </View>

        <Text style={[styles.coachBio, { color: t2 }]} numberOfLines={2}>{item.bio}</Text>

        {/* Specializations */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.specsRow}>
          {item.specializations.map((spec) => (
            <View key={spec} style={[styles.specChip, { backgroundColor: chipBg }]}>
              <Text style={styles.specEmoji}>{SPORT_EMOJIS[spec] || '🏅'}</Text>
              <Text style={[styles.specText, { color: chipTxt }]}>{spec}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.cardFooter}>
          <View style={styles.ratingRow}>
            <Text style={[styles.ratingStars, { color: colors.accent }]}>{renderStars(Number(item.rating_avg))}</Text>
            <Text style={[styles.ratingText, { color: t2 }]}>
              {Number(item.rating_avg).toFixed(1)} ({item.rating_count})
            </Text>
          </View>
          <Text style={[styles.sessionCount, { color: t3 }]}>
            {item.total_sessions} {t('coaching.sessions', 'sessions')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.separator }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{t('coaching.title', 'Coaching')}</Text>
        <TouchableOpacity
          style={[styles.mySessionsButton, { backgroundColor: colors.primaryLight }]}
          onPress={() => navigation.navigate('MySessions')}
        >
          <Text style={[styles.mySessionsText, { color: colors.primary }]}>{t('coaching.mySessions', 'My Sessions')}</Text>
        </TouchableOpacity>
      </View>

      {/* Sport filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {SPORT_FILTERS.map((sport) => (
          <TouchableOpacity
            key={sport}
            style={[styles.filterChip, { backgroundColor: colors.chipBackground }, selectedSport === sport && { backgroundColor: colors.chipSelectedBackground }]}
            onPress={() => setSelectedSport(sport)}
          >
            <Text style={[styles.filterText, { color: colors.chipText }, selectedSport === sport && { color: colors.chipSelectedText }]}>
              {sport === 'All' ? t('coaching.allSports', 'All Sports') : sport}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : coaches.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>💪</Text>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>{t('coaching.noCoaches', 'No coaches found')}</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            {t('coaching.noCoachesHint', 'Try a different sport or check back later!')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={coaches}
          renderItem={renderCoach}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: fontSize.title, fontWeight: fontWeight.bold, textTransform: 'capitalize' },
  mySessionsButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.pill,
  },
  mySessionsText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  filterRow: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, gap: spacing.sm },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.pill,
    marginRight: spacing.sm,
  },
  filterText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm, paddingBottom: spacing.xxxl, gap: spacing.md },
  coachCard: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    padding: spacing.lg,
    ...shadow.sm,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  avatarRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: { fontSize: 20, fontWeight: fontWeight.bold },
  nameBlock: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  coachName: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold },
  verifiedBadge: {
    fontSize: fontSize.xs, fontWeight: fontWeight.bold,
    borderRadius: 10,
    width: 18, height: 18, textAlign: 'center', lineHeight: 18, overflow: 'hidden',
  },
  coachCity: { fontSize: fontSize.sm, marginTop: 2 },
  rateBlock: { alignItems: 'flex-end' },
  rateAmount: { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  rateLabel: { fontSize: fontSize.xs },
  coachBio: { fontSize: fontSize.md, lineHeight: 18, marginBottom: spacing.sm },
  specsRow: { marginBottom: spacing.sm },
  specChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: spacing.sm, paddingVertical: 3,
    borderRadius: borderRadius.pill, marginRight: spacing.xs,
  },
  specEmoji: { fontSize: 12 },
  specText: { fontSize: fontSize.xs, fontWeight: fontWeight.medium },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  ratingStars: { fontSize: fontSize.sm },
  ratingText: { fontSize: fontSize.sm },
  sessionCount: { fontSize: fontSize.xs },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xxxl },
  emptyIcon: { fontSize: 56, marginBottom: spacing.lg },
  emptyTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.semibold },
  emptySubtitle: { fontSize: fontSize.base, textAlign: 'center', marginTop: spacing.sm },
});

export default CoachesScreen;
