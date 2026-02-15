import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, fontSize, fontWeight } from '../../theme';
import { statsApi, LeaderboardEntry } from '../../services/stats';
import { SPORTS } from '../../utils/constants';

type Tab = 'global' | 'sport';

const LeaderboardsScreen = ({ route }: { route?: { params?: { sport?: string } } }) => {
  const { colors } = useTheme();
  const sportParam = route?.params?.sport;
  const [tab, setTab] = useState<Tab>(sportParam ? 'sport' : 'global');
  const [sport, setSport] = useState(sportParam ?? '');
  const [list, setList] = useState<LeaderboardEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      if (tab === 'sport' && sport) {
        const res = await statsApi.getLeaderboardBySport(sport);
        setList(res.leaderboard ?? []);
        setTotal(res.total ?? 0);
      } else {
        const res = await statsApi.getLeaderboards({ sort: 'karma', limit: 50 });
        setList(res.leaderboard ?? []);
        setTotal(res.total ?? 0);
      }
    } catch (e) {
      console.error(e);
      setList([]);
      setTotal(0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    load();
  }, [tab, sport]);

  useEffect(() => {
    if (sportParam) {
      setTab('sport');
      setSport(sportParam);
    }
  }, [sportParam]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const renderItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    const isAlt = index % 2 === 1;
    const bg = isAlt ? colors.cardAltBackground : colors.cardBackground;
    const border = isAlt ? colors.cardAltBorder : colors.cardBorder;
    const textPri = isAlt ? colors.cardAltTextPrimary : colors.textPrimary;
    const textSec = isAlt ? colors.cardAltTextSecondary : colors.textSecondary;
    return (
      <View style={[styles.row, { backgroundColor: bg, borderColor: border }]}>
        <View style={[styles.rankBadge, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.rankText, { color: colors.primary }]}>{item.rank}</Text>
        </View>
        <View style={styles.rowBody}>
          <Text style={[styles.rowName, { color: textPri }]} numberOfLines={1}>
            {item.name || 'Player'}
          </Text>
          <Text style={[styles.rowMeta, { color: textSec }]} numberOfLines={1}>
            {[item.city, item.country].filter(Boolean).join(', ') || '—'}
          </Text>
        </View>
        <View style={styles.rowRight}>
          {item.karma_points != null && (
            <Text style={[styles.karmaText, { color: textPri }]}>{item.karma_points} ⭐</Text>
          )}
          {item.wins != null && (
            <Text style={[styles.statText, { color: textSec }]}>{item.wins} W</Text>
          )}
          {item.matches_played != null && (
            <Text style={[styles.statText, { color: textSec }]}>{item.matches_played} matches</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: colors.background, borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity
          style={[styles.tab, tab === 'global' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
          onPress={() => { setTab('global'); setSport(''); }}
        >
          <Text style={[styles.tabText, { color: tab === 'global' ? colors.primary : colors.textSecondary }]}>
            Global
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'sport' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
          onPress={() => setTab('sport')}
        >
          <Text style={[styles.tabText, { color: tab === 'sport' ? colors.primary : colors.textSecondary }]}>
            By sport
          </Text>
        </TouchableOpacity>
      </View>

      {tab === 'sport' && (
        <View style={[styles.sportChips, { backgroundColor: colors.background }]}>
          <FlatList
            horizontal
            data={SPORTS}
            keyExtractor={(s) => s}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipListContent}
            renderItem={({ item: s }) => (
              <TouchableOpacity
                style={[
                  styles.chip,
                  { backgroundColor: colors.chipBackground },
                  sport === s && { backgroundColor: colors.primaryLight, borderColor: colors.primary, borderWidth: 1 },
                ]}
                onPress={() => setSport(s)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: colors.textSecondary },
                    sport === s && { color: colors.primary, fontWeight: fontWeight.semibold },
                  ]}
                >
                  {s}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {tab === 'sport' && !sport ? (
        <View style={styles.centered}>
          <Text style={[styles.hint, { color: colors.textTertiary }]}>Select a sport above</Text>
        </View>
      ) : loading && list.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => item.user_id + String(item.rank)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={[styles.empty, { color: colors.textTertiary }]}>No entries yet</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: spacing.lg,
  },
  tab: {
    paddingVertical: spacing.md,
    marginRight: spacing.lg,
  },
  tabText: { fontSize: fontSize.base, fontWeight: fontWeight.medium },
  sportChips: { paddingVertical: spacing.sm },
  chipListContent: { paddingHorizontal: spacing.lg },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
  },
  chipText: { fontSize: fontSize.sm },
  listContent: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  rankText: { fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  rowBody: { flex: 1 },
  rowName: { fontSize: fontSize.base, fontWeight: fontWeight.semibold },
  rowMeta: { fontSize: fontSize.xs, marginTop: 2 },
  rowRight: { alignItems: 'flex-end' },
  karmaText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  statText: { fontSize: fontSize.xs, marginTop: 2 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  hint: { fontSize: fontSize.base },
  empty: { fontSize: fontSize.base },
});

export default LeaderboardsScreen;
