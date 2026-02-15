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
import { colors, spacing, borderRadius, fontSize, fontWeight, shadow } from '../../theme';

const SPORT_FILTERS = ['All', 'Tennis', 'Cricket', 'Swimming', 'Basketball', 'Fitness', 'Soccer', 'Running'];

const SPORT_EMOJIS: Record<string, string> = {
  Tennis: '🎾', Cricket: '🏏', Swimming: '🏊', Basketball: '🏀',
  Fitness: '💪', Soccer: '⚽', Running: '🏃', 'Water Polo': '🤽',
  Batting: '🏏', Bowling: '🎳', Fielding: '🏏',
  'Team Strategy': '📋', 'Mental Coaching': '🧠',
};

const CoachesScreen = () => {
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

  const renderCoach = ({ item }: { item: CoachItem }) => {
    const initial = item.User?.name?.charAt(0)?.toUpperCase() || '?';

    return (
      <TouchableOpacity
        style={styles.coachCard}
        onPress={() => navigation.navigate('CoachProfile', { coachId: item.id })}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <View style={styles.nameBlock}>
              <View style={styles.nameRow}>
                <Text style={styles.coachName} numberOfLines={1}>{item.User?.name}</Text>
                {item.is_verified && <Text style={styles.verifiedBadge}>✓</Text>}
              </View>
              <Text style={styles.coachCity}>📍 {item.city || item.User?.city || 'Unknown'}</Text>
            </View>
          </View>
          <View style={styles.rateBlock}>
            <Text style={styles.rateAmount}>${Number(item.hourly_rate).toFixed(0)}</Text>
            <Text style={styles.rateLabel}>/hr</Text>
          </View>
        </View>

        <Text style={styles.coachBio} numberOfLines={2}>{item.bio}</Text>

        {/* Specializations */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.specsRow}>
          {item.specializations.map((spec) => (
            <View key={spec} style={styles.specChip}>
              <Text style={styles.specEmoji}>{SPORT_EMOJIS[spec] || '🏅'}</Text>
              <Text style={styles.specText}>{spec}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.cardFooter}>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingStars}>{renderStars(Number(item.rating_avg))}</Text>
            <Text style={styles.ratingText}>
              {Number(item.rating_avg).toFixed(1)} ({item.rating_count})
            </Text>
          </View>
          <Text style={styles.sessionCount}>
            {item.total_sessions} {t('coaching.sessions', 'sessions')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('coaching.title', 'Coaching')}</Text>
        <TouchableOpacity
          style={styles.mySessionsButton}
          onPress={() => navigation.navigate('MySessions')}
        >
          <Text style={styles.mySessionsText}>{t('coaching.mySessions', 'My Sessions')}</Text>
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
            style={[styles.filterChip, selectedSport === sport && styles.filterChipActive]}
            onPress={() => setSelectedSport(sport)}
          >
            <Text style={[styles.filterText, selectedSport === sport && styles.filterTextActive]}>
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
          <Text style={styles.emptyIcon}>🏋️</Text>
          <Text style={styles.emptyTitle}>{t('coaching.noCoaches', 'No coaches found')}</Text>
          <Text style={styles.emptySubtitle}>
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
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  header: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: fontSize.title, fontWeight: fontWeight.bold, color: colors.textPrimary },
  mySessionsButton: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.pill,
  },
  mySessionsText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.primary },
  filterRow: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, gap: spacing.sm },
  filterChip: {
    backgroundColor: colors.chipBackground,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.pill,
    marginRight: spacing.sm,
  },
  filterChipActive: { backgroundColor: colors.chipSelectedBackground },
  filterText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.chipText },
  filterTextActive: { color: colors.chipSelectedText },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm, paddingBottom: spacing.xxxl, gap: spacing.md },
  coachCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.lg,
    ...shadow.sm,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  avatarRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center', alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: { fontSize: 20, fontWeight: fontWeight.bold, color: colors.primary },
  nameBlock: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  coachName: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  verifiedBadge: {
    fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.textInverse,
    backgroundColor: colors.accentGreen, borderRadius: 10,
    width: 18, height: 18, textAlign: 'center', lineHeight: 18, overflow: 'hidden',
  },
  coachCity: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  rateBlock: { alignItems: 'flex-end' },
  rateAmount: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.primary },
  rateLabel: { fontSize: fontSize.xs, color: colors.textTertiary },
  coachBio: { fontSize: fontSize.md, color: colors.textSecondary, lineHeight: 18, marginBottom: spacing.sm },
  specsRow: { marginBottom: spacing.sm },
  specChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: colors.chipBackground,
    paddingHorizontal: spacing.sm, paddingVertical: 3,
    borderRadius: borderRadius.pill, marginRight: spacing.xs,
  },
  specEmoji: { fontSize: 12 },
  specText: { fontSize: fontSize.xs, color: colors.chipText, fontWeight: fontWeight.medium },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  ratingStars: { fontSize: fontSize.sm, color: colors.accent },
  ratingText: { fontSize: fontSize.sm, color: colors.textSecondary },
  sessionCount: { fontSize: fontSize.xs, color: colors.textTertiary },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xxxl },
  emptyIcon: { fontSize: 56, marginBottom: spacing.lg },
  emptyTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  emptySubtitle: { fontSize: fontSize.base, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm },
});

export default CoachesScreen;
