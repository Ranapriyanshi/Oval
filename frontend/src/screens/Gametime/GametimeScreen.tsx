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
import { colors, spacing, borderRadius, fontSize, fontWeight, shadow } from '../../theme';
import { gametimeApi, GametimeEvent } from '../../services/gametime';

const SPORT_EMOJIS: Record<string, string> = {
  tennis: '🎾', basketball: '🏀', soccer: '⚽', football: '🏈',
  cricket: '🏏', swimming: '🏊', running: '🏃', cycling: '🚴',
  volleyball: '🏐', badminton: '🏸', golf: '⛳', hockey: '🏒',
  rugby: '🏉', surfing: '🏄', yoga: '🧘', gym: '🏋️', hiking: '🥾',
  boxing: '🥊', skating: '⛸️', skiing: '⛷️',
};

const EVENT_TYPE_COLORS: Record<string, string> = {
  casual: colors.accentGreen,
  competitive: colors.primary,
  training: colors.accent,
};

const GametimeScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

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

  const renderEventCard = ({ item }: { item: GametimeEvent }) => {
    const sportEmoji = SPORT_EMOJIS[item.sport_name.toLowerCase()] || '🏅';
    const spotsLeft = item.max_players - item.current_players;
    const isFull = spotsLeft <= 0;
    const typeColor = EVENT_TYPE_COLORS[item.event_type] || colors.textTertiary;

    return (
      <TouchableOpacity
        style={styles.eventCard}
        onPress={() => navigation.navigate('GametimeDetail', { eventId: item.id })}
        activeOpacity={0.7}
      >
        {/* Top row: sport emoji + title + type badge */}
        <View style={styles.cardTopRow}>
          <Text style={styles.sportEmoji}>{sportEmoji}</Text>
          <View style={styles.cardTitleArea}>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.cardSport}>{item.sport_name}</Text>
          </View>
          <View style={[styles.typeBadge, { backgroundColor: typeColor }]}>
            <Text style={styles.typeBadgeText}>
              {item.event_type.charAt(0).toUpperCase() + item.event_type.slice(1)}
            </Text>
          </View>
        </View>

        {/* Info row */}
        <View style={styles.infoRow}>
          <Text style={styles.infoItem}>📅 {formatDate(item.start_time)}</Text>
          <Text style={styles.infoItem}>🕐 {formatTime(item.start_time)}</Text>
          {item.city && <Text style={styles.infoItem}>📍 {item.city}</Text>}
        </View>

        {/* Bottom row: players + cost */}
        <View style={styles.cardBottomRow}>
          <View style={styles.playersSection}>
            <View style={styles.playersDots}>
              {Array.from({ length: Math.min(item.current_players, 5) }).map((_, i) => (
                <View key={i} style={styles.playerDot} />
              ))}
              {item.current_players > 5 && (
                <Text style={styles.playersExtra}>+{item.current_players - 5}</Text>
              )}
            </View>
            <Text style={[styles.spotsText, isFull && styles.spotsTextFull]}>
              {isFull ? t('gametime.full') : `${spotsLeft} ${t('gametime.spotsLeft')}`}
            </Text>
          </View>
          <Text style={styles.costText}>
            {formatCost(item.cost_per_person_cents, item.currency)}
          </Text>
        </View>

        {/* Creator */}
        {item.Creator && (
          <View style={styles.creatorRow}>
            <Text style={styles.creatorLabel}>{t('gametime.organizedBy')}</Text>
            <Text style={styles.creatorName}>{item.Creator.name}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('gametime.title')}</Text>
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>{t('gametime.title')}</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('GametimeCreate')}
            activeOpacity={0.7}
          >
            <Text style={styles.createButtonText}>+ {t('gametime.create')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Type filter */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {[null, 'casual', 'competitive', 'training'].map((type) => (
            <TouchableOpacity
              key={type || 'all'}
              style={[styles.filterChip, typeFilter === type && styles.filterChipActive]}
              onPress={() => setTypeFilter(type)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, typeFilter === type && styles.filterChipTextActive]}>
                {type ? type.charAt(0).toUpperCase() + type.slice(1) : t('gametime.allTypes')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {events.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🎮</Text>
          <Text style={styles.emptyTitle}>{t('gametime.noEvents')}</Text>
          <Text style={styles.emptySubtitle}>{t('gametime.noEventsHint')}</Text>
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
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  header: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
    paddingTop: 56,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
  },
  createButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textInverse,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Filters
  filterContainer: {
    backgroundColor: colors.background,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  filterScroll: { paddingHorizontal: spacing.xl, gap: spacing.sm },
  filterChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.chipBackground,
    marginRight: spacing.sm,
  },
  filterChipActive: { backgroundColor: colors.primary },
  filterChipText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.chipText },
  filterChipTextActive: { color: colors.textInverse },

  // List
  listContent: { padding: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.md },

  // Event card
  eventCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadow.sm,
  },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  sportEmoji: { fontSize: 32 },
  cardTitleArea: { flex: 1 },
  cardTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  cardSport: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  typeBadge: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.pill },
  typeBadgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: '#FFFFFF' },

  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
  },
  infoItem: { fontSize: fontSize.sm, color: colors.textSecondary },

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
    backgroundColor: colors.primary,
    opacity: 0.7,
  },
  playersExtra: { fontSize: fontSize.xs, color: colors.textTertiary, marginLeft: 2 },
  spotsText: { fontSize: fontSize.sm, color: colors.accentGreen, fontWeight: fontWeight.medium },
  spotsTextFull: { color: colors.accentRed },
  costText: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary },

  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.separator,
  },
  creatorLabel: { fontSize: fontSize.xs, color: colors.textTertiary },
  creatorName: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.textSecondary },

  // Empty
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xxxl },
  emptyEmoji: { fontSize: 56, marginBottom: spacing.lg },
  emptyTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.textPrimary, textAlign: 'center' },
  emptySubtitle: { fontSize: fontSize.base, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm },
});

export default GametimeScreen;
