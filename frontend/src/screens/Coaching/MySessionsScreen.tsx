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
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, fontSize, fontWeight, shadow } from '../../theme';

type Tab = 'upcoming' | 'past';

const MySessionsScreen = () => {
  const { colors } = useTheme();
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
      <View style={[styles.sessionCard, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
        <View style={styles.sessionHeader}>
          <View style={styles.coachRow}>
            <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.avatarText, { color: colors.primary }]}>{initial}</Text>
            </View>
            <View style={styles.sessionInfo}>
              <Text style={[styles.coachName, { color: colors.textPrimary }]}>{coachName}</Text>
              <Text style={[styles.sportText, { color: colors.textSecondary }]}>{item.sport}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor(item.status) }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={[styles.detailsRow, { borderTopColor: colors.separator }]}>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>📅</Text>
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>{formatDate(item.session_date)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>⏰</Text>
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>{item.start_time} - {item.end_time}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>💰</Text>
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>${Number(item.cost).toFixed(2)}</Text>
          </View>
        </View>

        {item.location && (
          <Text style={[styles.locationText, { color: colors.textSecondary }]}>📍 {item.location}</Text>
        )}

        {item.notes && (
          <Text style={[styles.notesText, { color: colors.textTertiary }]} numberOfLines={2}>{item.notes}</Text>
        )}

        {canCancel && (
          <TouchableOpacity style={[styles.cancelButton, { borderColor: colors.accentRed }]} onPress={() => handleCancel(item)}>
            <Text style={[styles.cancelButtonText, { color: colors.accentRed }]}>{t('coaching.cancelSession', 'Cancel Session')}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      {/* Tabs */}
      <View style={[styles.tabRow, { backgroundColor: colors.background, borderBottomColor: colors.separator }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && { borderBottomColor: colors.primary }]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, { color: colors.textTertiary }, activeTab === 'upcoming' && { color: colors.primary, fontWeight: fontWeight.semibold }]}>
            {t('coaching.upcoming', 'Upcoming')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && { borderBottomColor: colors.primary }]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, { color: colors.textTertiary }, activeTab === 'past' && { color: colors.primary, fontWeight: fontWeight.semibold }]}>
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
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            {activeTab === 'upcoming'
              ? t('coaching.noUpcoming', 'No upcoming sessions')
              : t('coaching.noPast', 'No past sessions')}
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
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
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl, paddingTop: spacing.md,
    borderBottomWidth: 1,
  },
  tab: {
    paddingVertical: spacing.md, paddingHorizontal: spacing.lg,
    borderBottomWidth: 2, borderBottomColor: 'transparent', marginRight: spacing.lg,
  },
  tabText: { fontSize: fontSize.base, fontWeight: fontWeight.medium },
  list: { padding: spacing.xl, gap: spacing.md },
  sessionCard: {
    borderRadius: borderRadius.md,
    borderWidth: 1, padding: spacing.lg,
    ...shadow.sm,
  },
  sessionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.md,
  },
  coachRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: { fontSize: 16, fontWeight: fontWeight.bold },
  sessionInfo: { flex: 1 },
  coachName: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold },
  sportText: { fontSize: fontSize.sm },
  statusBadge: {
    paddingHorizontal: spacing.sm + 2, paddingVertical: 3,
    borderRadius: borderRadius.pill,
  },
  statusText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  detailsRow: {
    flexDirection: 'row', gap: spacing.lg,
    paddingTop: spacing.sm, borderTopWidth: 1,
  },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  detailIcon: { fontSize: 14 },
  detailText: { fontSize: fontSize.sm },
  locationText: {
    fontSize: fontSize.sm, marginTop: spacing.sm,
  },
  notesText: {
    fontSize: fontSize.sm, fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  cancelButton: {
    marginTop: spacing.md, paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill, borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xxxl },
  emptyIcon: { fontSize: 56, marginBottom: spacing.lg },
  emptyTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.semibold },
  emptySubtitle: {
    fontSize: fontSize.base, textAlign: 'center', marginTop: spacing.sm,
  },
});

export default MySessionsScreen;
