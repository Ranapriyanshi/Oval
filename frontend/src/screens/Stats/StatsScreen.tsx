import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, fontSize, fontWeight, shadow } from '../../theme';
import { statsApi, StatsResponse } from '../../services/stats';

const StatsScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const res = await statsApi.getStats();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  if (loading && !data) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.backgroundSecondary }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Karma card */}
        <View style={[styles.karmaCard, { backgroundColor: colors.primary }, shadow.md]}>
          <Text style={styles.karmaEmoji}>⭐</Text>
          <Text style={styles.karmaLabel}>Karma Points</Text>
          <Text style={styles.karmaValue}>{data?.karma_points ?? 0}</Text>
        </View>

        {/* Overall stats */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Overall</Text>
        <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Matches played</Text>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {data?.overall?.matches_played ?? 0}
            </Text>
          </View>
          <View style={[styles.separator, { backgroundColor: colors.separator }]} />
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Wins</Text>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{data?.overall?.wins ?? 0}</Text>
          </View>
          <View style={[styles.separator, { backgroundColor: colors.separator }]} />
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Hours played</Text>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {data?.overall?.hours_played ?? 0}
            </Text>
          </View>
        </View>

        {/* By sport */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>By sport</Text>
        {(data?.by_sport?.length ?? 0) === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
              No sport stats yet. Join gametimes to build your stats.
            </Text>
          </View>
        ) : (
          (data?.by_sport ?? []).map((s, index) => {
            const isAlt = index % 2 === 1;
            const bg = isAlt ? colors.cardAltBackground : colors.background;
            const border = isAlt ? colors.cardAltBorder : colors.cardBorder;
            const textPri = isAlt ? colors.cardAltTextPrimary : colors.textPrimary;
            const textSec = isAlt ? colors.cardAltTextSecondary : colors.textSecondary;
            return (
              <TouchableOpacity
                key={`${s.sport}-${index}`}
                style={[styles.sportCard, { backgroundColor: bg, borderColor: border }]}
                onPress={() => navigation.navigate('Leaderboards', { sport: s.sport })}
                activeOpacity={0.8}
              >
                <Text style={[styles.sportName, { color: textPri }]}>{s.sport}</Text>
                <View style={styles.sportStats}>
                  <Text style={[styles.sportStat, { color: textSec }]}>
                    {s.matches_played} matches · {s.wins} W
                  </Text>
                  <Text style={[styles.sportStat, { color: textSec }]}>{Number(s.hours_played).toFixed(1)} hrs</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        <TouchableOpacity
          style={[styles.leaderboardCta, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('Leaderboards')}
          activeOpacity={0.8}
        >
          <Text style={styles.leaderboardCtaText}>View leaderboards</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  karmaCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  karmaEmoji: { fontSize: 40, marginBottom: spacing.xs },
  karmaLabel: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.9)', marginBottom: spacing.xs },
  karmaValue: { fontSize: 36, fontWeight: fontWeight.bold, color: '#FFFFFF' },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.md,
  },
  card: {
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  statLabel: { fontSize: fontSize.base },
  statValue: { fontSize: fontSize.base, fontWeight: fontWeight.semibold },
  separator: { height: 1 },
  emptyCard: {
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyText: { fontSize: fontSize.base, textAlign: 'center' },
  sportCard: {
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  sportName: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, marginBottom: spacing.xs },
  sportStats: { flexDirection: 'row', justifyContent: 'space-between' },
  sportStat: { fontSize: fontSize.sm },
  leaderboardCta: {
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  leaderboardCtaText: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: '#FFFFFF' },
});

export default StatsScreen;
