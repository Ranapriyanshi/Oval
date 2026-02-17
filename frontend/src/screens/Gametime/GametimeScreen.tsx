import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, fontSize, fontWeight, shadow } from '../../theme';
import { gametimeApi, GametimeEvent } from '../../services/gametime';

const SPORT_EMOJIS: Record<string, string> = {
  tennis: '🎾', basketball: '🏀', soccer: '⚽', football: '🏈',
  cricket: '🏏', swimming: '🏊', running: '🏃', cycling: '🚴',
  volleyball: '🏐', badminton: '🏸', golf: '⛳', hockey: '🏒',
  rugby: '🏉', surfing: '🏄', yoga: '🧘', gym: '🏋️', hiking: '🥾',
  boxing: '🥊', skating: '⛸️', skiing: '⛷️',
};

const GametimeScreen = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  const EVENT_TYPE_COLORS: Record<string, string> = {
    casual: colors.accentGreen,
    competitive: colors.primary,
    training: colors.accent,
  };

  const [events, setEvents] = useState<GametimeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sportFilter, setSportFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    try {
      const params: any = { limit: 30 };
      if (sportFilter) params.sport = sportFilter;
      if (typeFilter) params.event_type = typeFilter;
      const response = await gametimeApi.list(params);
      setEvents(response.data.events);
    } catch (error) {
      console.error('Failed to load gametime events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [sportFilter, typeFilter]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadEvents();
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  const formatCost = (cents: number, currency: string) => {
    if (cents === 0) return t('gametime.free');
    const symbol = currency === 'USD' ? '$' : '$';
    return `${symbol}${(cents / 100).toFixed(2)}`;
  };

  const renderEventCard = ({ item, index }: { item: GametimeEvent; index: number }) => {
    const sportEmoji = SPORT_EMOJIS[item.sport_name.toLowerCase()] || '🏅';
    const spotsLeft = item.max_players - item.current_players;
    const isFull = spotsLeft <= 0;
    const typeColor = EVENT_TYPE_COLORS[item.event_type] || colors.textTertiary;
    const isAlt = index % 2 === 1;
    const bg = isAlt ? colors.cardAltBackground : colors.cardBackground;
    const border = isAlt ? colors.cardAltBorder : colors.cardBorder;
    const t1 = isAlt ? colors.cardAltTextPrimary : colors.textPrimary;
    const t2 = isAlt ? colors.cardAltTextSecondary : colors.textSecondary;
    const t3 = isAlt ? colors.cardAltTextSecondary : colors.textTertiary;

    return (
      <TouchableOpacity
        style={[styles.eventCard, { backgroundColor: bg, borderColor: border }]}
        onPress={() => navigation.navigate('GametimeDetail', { eventId: item.id })}
        activeOpacity={0.7}
      >
        {/* Top row: sport emoji + title + type badge */}
        <View style={styles.cardTopRow}>
          <Text style={styles.sportEmoji}>{sportEmoji}</Text>
          <View style={styles.cardTitleArea}>
            <Text style={[styles.cardTitle, { color: t1 }]} numberOfLines={1}>{item.title}</Text>
            <Text style={[styles.cardSport, { color: t2 }]}>{item.sport_name}</Text>
          </View>
          <View style={[styles.typeBadge, { backgroundColor: typeColor }]}>
            <Text style={styles.typeBadgeText}>
              {item.event_type.charAt(0).toUpperCase() + item.event_type.slice(1)}
            </Text>
          </View>
        </View>

        {/* Info row */}
        <View style={[styles.infoRow, { borderBottomColor: isAlt ? 'rgba(255,255,255,0.2)' : colors.separator }]}>
          <Text style={[styles.infoItem, { color: t2 }]}>📅 {formatDate(item.start_time)}</Text>
          <Text style={[styles.infoItem, { color: t2 }]}>🕐 {formatTime(item.start_time)}</Text>
          {item.city && <Text style={[styles.infoItem, { color: t2 }]}>📌 {item.city}</Text>}
        </View>

        {/* Bottom row: players + cost */}
        <View style={styles.cardBottomRow}>
          <View style={styles.playersSection}>
            <View style={styles.playersDots}>
              {Array.from({ length: Math.min(item.current_players, 5) }).map((_, i) => (
                <View key={i} style={[styles.playerDot, { backgroundColor: isAlt ? 'rgba(255,255,255,0.8)' : colors.primary }]} />
              ))}
              {item.current_players > 5 && (
                <Text style={[styles.playersExtra, { color: t3 }]}>+{item.current_players - 5}</Text>
              )}
            </View>
            <Text style={[styles.spotsText, { color: isFull ? colors.accentRed : colors.accentGreen }]}>
              {isFull ? t('gametime.full') : `${spotsLeft} ${t('gametime.spotsLeft')}`}
            </Text>
          </View>
          <Text style={[styles.costText, { color: t1 }]}>
            {formatCost(item.cost_per_person_cents, item.currency)}
          </Text>
        </View>

        {/* Creator */}
        {item.Creator && (
          <View style={[styles.creatorRow, { borderTopColor: isAlt ? 'rgba(255,255,255,0.2)' : colors.separator }]}>
            <Text style={[styles.creatorLabel, { color: t3 }]}>{t('gametime.organizedBy')}</Text>
            <Text style={[styles.creatorName, { color: t2 }]}>{item.Creator.name}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.borderLight }]}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t('gametime.title')}</Text>
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.borderLight }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t('gametime.title')}</Text>
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('GametimeCreate')}
            activeOpacity={0.7}
          >
            <Text style={[styles.createButtonText, { color: colors.textInverse }]}>+ {t('gametime.create')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Type filter */}
      <View style={[styles.filterContainer, { backgroundColor: colors.background, borderBottomColor: colors.borderLight }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {[null, 'casual', 'competitive', 'training'].map((type) => (
            <TouchableOpacity
              key={type || 'all'}
              style={[styles.filterChip, { backgroundColor: typeFilter === type ? colors.primary : colors.chipBackground }]}
              onPress={() => setTypeFilter(type)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, { color: typeFilter === type ? colors.textInverse : colors.chipText }]}>
                {type ? type.charAt(0).toUpperCase() + type.slice(1) : t('gametime.allTypes')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {events.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🏅</Text>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>{t('gametime.noEvents')}</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>{t('gametime.noEventsHint')}</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={renderEventCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
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
    paddingTop: 56,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.3,
    textTransform: 'capitalize',
  },
  createButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
  },
  createButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Filters
  filterContainer: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  filterScroll: { paddingHorizontal: spacing.xl, gap: spacing.sm },
  filterChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
    marginRight: spacing.sm,
  },
  filterChipText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },

  // List
  listContent: { padding: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.md },

  // Event card
  eventCard: {
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    ...shadow.sm,
  },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  sportEmoji: { fontSize: 32 },
  cardTitleArea: { flex: 1 },
  cardTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold },
  cardSport: { fontSize: fontSize.sm, marginTop: 2 },
  typeBadge: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.pill },
  typeBadgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: '#FFFFFF' },

  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  infoItem: { fontSize: fontSize.sm },

  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playersSection: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  playersDots: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  playerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    opacity: 0.7,
  },
  playersExtra: { fontSize: fontSize.xs, marginLeft: 2 },
  spotsText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  costText: { fontSize: fontSize.lg, fontWeight: fontWeight.bold },

  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  creatorLabel: { fontSize: fontSize.xs },
  creatorName: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },

  // Empty
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xxxl },
  emptyEmoji: { fontSize: 56, marginBottom: spacing.lg },
  emptyTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, textAlign: 'center' },
  emptySubtitle: { fontSize: fontSize.base, textAlign: 'center', marginTop: spacing.sm },
});

export default GametimeScreen;
