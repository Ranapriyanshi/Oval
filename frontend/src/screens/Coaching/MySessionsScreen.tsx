import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import coachingApi, { CoachingSessionItem } from '../../services/coaching';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadow } from '../../theme';

type Tab = 'upcoming' | 'past';

const MySessionsScreen = () => {
  const { t } = useTranslation();
  const [sessions, setSessions] = useState<CoachingSessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('upcoming');

  const loadSessions = useCallback(async () => {
    try {
      const data = await coachingApi.getMySessions(
        activeTab === 'upcoming' ? { upcoming: true } : {}
      );
      const filtered =
        activeTab === 'upcoming'
          ? data.sessions.filter((s) => ['pending', 'confirmed'].includes(s.status))
          : data.sessions.filter((s) => ['completed', 'cancelled'].includes(s.status));
      setSessions(filtered);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadSessions();
    }, [loadSessions])
  );

  const handleCancel = (session: CoachingSessionItem) => {
    Alert.alert(
      t('coaching.cancelSession', 'Cancel Session'),
      t('coaching.cancelConfirm', 'Are you sure you want to cancel this session?'),
      [
        { text: t('common.cancel', 'No'), style: 'cancel' },
        {
          text: t('coaching.cancelSession', 'Yes, Cancel'),
          style: 'destructive',
          onPress: async () => {
            try {
              await coachingApi.cancelSession(session.id);
              setSessions((prev) => prev.filter((s) => s.id !== session.id));
            } catch (error) {
              console.error('Cancel failed:', error);
            }
          },
        },
      ]
    );
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return colors.accentGreen;
      case 'pending': return colors.warning;
      case 'completed': return colors.primary;
      case 'cancelled': return colors.accentRed;
      default: return colors.textTertiary;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString(undefined, {
      weekday: 'short', month: 'short', day: 'numeric',
    });
  };

  const renderSession = ({ item }: { item: CoachingSessionItem }) => {
    const coachName = item.Coach?.User?.name || 'Coach';
    const initial = coachName.charAt(0).toUpperCase();
    const canCancel = ['pending', 'confirmed'].includes(item.status);

    return (
      <View style={styles.sessionCard}>
        <View style={styles.sessionHeader}>
          <View style={styles.coachRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <View style={styles.sessionInfo}>
              <Text style={styles.coachName}>{coachName}</Text>
              <Text style={styles.sportText}>{item.sport}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor(item.status) }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>📅</Text>
            <Text style={styles.detailText}>{formatDate(item.session_date)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>⏰</Text>
            <Text style={styles.detailText}>{item.start_time} - {item.end_time}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>💰</Text>
            <Text style={styles.detailText}>${Number(item.cost).toFixed(2)}</Text>
          </View>
        </View>

        {item.location && (
          <Text style={styles.locationText}>📍 {item.location}</Text>
        )}

        {item.notes && (
          <Text style={styles.notesText} numberOfLines={2}>{item.notes}</Text>
        )}

        {canCancel && (
          <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancel(item)}>
            <Text style={styles.cancelButtonText}>{t('coaching.cancelSession', 'Cancel Session')}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>
            {t('coaching.upcoming', 'Upcoming')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.tabActive]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.tabTextActive]}>
            {t('coaching.past', 'Past')}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : sessions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>
            {activeTab === 'upcoming'
              ? t('coaching.noUpcoming', 'No upcoming sessions')
              : t('coaching.noPast', 'No past sessions')}
          </Text>
          <Text style={styles.emptySubtitle}>
            {t('coaching.bookHint', 'Find a coach and book your first session!')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          renderItem={renderSession}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); loadSessions(); }}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabRow: {
    flexDirection: 'row', backgroundColor: colors.background,
    paddingHorizontal: spacing.xl, paddingTop: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.separator,
  },
  tab: {
    paddingVertical: spacing.md, paddingHorizontal: spacing.lg,
    borderBottomWidth: 2, borderBottomColor: 'transparent', marginRight: spacing.lg,
  },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { fontSize: fontSize.base, fontWeight: fontWeight.medium, color: colors.textTertiary },
  tabTextActive: { color: colors.primary, fontWeight: fontWeight.semibold },
  list: { padding: spacing.xl, gap: spacing.md },
  sessionCard: {
    backgroundColor: colors.cardBackground, borderRadius: borderRadius.md,
    borderWidth: 1, borderColor: colors.cardBorder, padding: spacing.lg,
    ...shadow.sm,
  },
  sessionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.md,
  },
  coachRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: { fontSize: 16, fontWeight: fontWeight.bold, color: colors.primary },
  sessionInfo: { flex: 1 },
  coachName: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  sportText: { fontSize: fontSize.sm, color: colors.textSecondary },
  statusBadge: {
    paddingHorizontal: spacing.sm + 2, paddingVertical: 3,
    borderRadius: borderRadius.pill,
  },
  statusText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  detailsRow: {
    flexDirection: 'row', gap: spacing.lg,
    paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.separator,
  },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  detailIcon: { fontSize: 14 },
  detailText: { fontSize: fontSize.sm, color: colors.textSecondary },
  locationText: {
    fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.sm,
  },
  notesText: {
    fontSize: fontSize.sm, color: colors.textTertiary, fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  cancelButton: {
    marginTop: spacing.md, paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill, borderWidth: 1, borderColor: colors.accentRed,
    alignItems: 'center',
  },
  cancelButtonText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.accentRed },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xxxl },
  emptyIcon: { fontSize: 56, marginBottom: spacing.lg },
  emptyTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  emptySubtitle: {
    fontSize: fontSize.base, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm,
  },
});

export default MySessionsScreen;
