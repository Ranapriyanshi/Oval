import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadow } from '../../theme';
import { gametimeApi, GametimeEvent } from '../../services/gametime';

const SPORT_EMOJIS: Record<string, string> = {
  tennis: '🎾', basketball: '🏀', soccer: '⚽', football: '🏈',
  cricket: '🏏', swimming: '🏊', running: '🏃', cycling: '🚴',
  volleyball: '🏐', badminton: '🏸', golf: '⛳', hockey: '🏒',
  rugby: '🏉', surfing: '🏄', yoga: '🧘', gym: '🏋️', hiking: '🥾',
};

const EVENT_TYPE_COLORS: Record<string, string> = {
  casual: colors.accentGreen,
  competitive: colors.primary,
  training: colors.accent,
};

type RouteParams = { GametimeDetail: { eventId: string } };

const GametimeDetailScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, 'GametimeDetail'>>();
  const { eventId } = route.params;

  const [event, setEvent] = useState<GametimeEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      const response = await gametimeApi.getById(eventId);
      setEvent(response.data);
    } catch (error) {
      console.error('Failed to load event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!event) return;
    try {
      setActionLoading(true);
      await gametimeApi.join(event.id);
      await loadEvent();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to join');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!event) return;
    Alert.alert(
      t('gametime.leaveEvent'),
      t('gametime.leaveConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('gametime.leave'),
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              await gametimeApi.leave(event.id);
              await loadEvent();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to leave');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCancel = async () => {
    if (!event) return;
    Alert.alert(
      t('gametime.cancelEvent'),
      t('gametime.cancelConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('gametime.cancelEvent'),
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              await gametimeApi.cancel(event.id);
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to cancel');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  const formatCost = (cents: number, currency: string) => {
    if (cents === 0) return t('gametime.free');
    const symbol = currency === 'USD' ? '$' : '$';
    return `${symbol}${(cents / 100).toFixed(2)} / person`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.container}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <Text style={styles.errorText}>{t('common.error')}</Text>
        </View>
      </View>
    );
  }

  const sportEmoji = SPORT_EMOJIS[event.sport_name.toLowerCase()] || '🏅';
  const typeColor = EVENT_TYPE_COLORS[event.event_type] || colors.textTertiary;
  const spotsLeft = event.max_players - event.current_players;
  const isFull = spotsLeft <= 0;
  const participants = event.GametimeParticipants || [];

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        {event.is_creator && event.status === 'upcoming' && (
          <TouchableOpacity onPress={handleCancel} style={styles.cancelHeaderBtn}>
            <Text style={styles.cancelHeaderText}>{t('gametime.cancelEvent')}</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroSection}>
          <Text style={styles.heroEmoji}>{sportEmoji}</Text>
          <Text style={styles.heroTitle}>{event.title}</Text>
          <View style={styles.heroBadges}>
            <View style={[styles.typeBadge, { backgroundColor: typeColor }]}>
              <Text style={styles.typeBadgeText}>
                {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}
              </Text>
            </View>
            {event.skill_level !== 'any' && (
              <View style={styles.skillBadge}>
                <Text style={styles.skillBadgeText}>
                  {event.skill_level.charAt(0).toUpperCase() + event.skill_level.slice(1)}
                </Text>
              </View>
            )}
            {event.status === 'cancelled' && (
              <View style={[styles.typeBadge, { backgroundColor: colors.accentRed }]}>
                <Text style={styles.typeBadgeText}>Cancelled</Text>
              </View>
            )}
          </View>
        </View>

        {/* Date & Time */}
        <View style={styles.card}>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📅</Text>
            <View>
              <Text style={styles.detailLabel}>{t('gametime.dateTime')}</Text>
              <Text style={styles.detailValue}>{formatDateTime(event.start_time)}</Text>
              <Text style={styles.detailSub}>
                {formatTime(event.start_time)} – {formatTime(event.end_time)}
              </Text>
            </View>
          </View>

          {(event.venue_name || event.address) && (
            <>
              <View style={styles.separator} />
              <View style={styles.detailRow}>
                <Text style={styles.detailIcon}>📍</Text>
                <View>
                  <Text style={styles.detailLabel}>{t('gametime.location')}</Text>
                  {event.venue_name && <Text style={styles.detailValue}>{event.venue_name}</Text>}
                  {event.address && <Text style={styles.detailSub}>{event.address}</Text>}
                </View>
              </View>
            </>
          )}

          <View style={styles.separator} />
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>💰</Text>
            <View>
              <Text style={styles.detailLabel}>{t('gametime.cost')}</Text>
              <Text style={styles.detailValue}>
                {formatCost(event.cost_per_person_cents, event.currency)}
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        {event.description && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('gametime.about')}</Text>
            <Text style={styles.descriptionText}>{event.description}</Text>
          </View>
        )}

        {/* Notes */}
        {event.notes && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('gametime.notes')}</Text>
            <Text style={styles.notesText}>{event.notes}</Text>
          </View>
        )}

        {/* Players */}
        <View style={styles.card}>
          <View style={styles.playersHeader}>
            <Text style={styles.cardTitle}>
              {t('gametime.players')} ({event.current_players}/{event.max_players})
            </Text>
            <Text style={[styles.spotsText, isFull && styles.spotsTextFull]}>
              {isFull ? t('gametime.full') : `${spotsLeft} ${t('gametime.spotsLeft')}`}
            </Text>
          </View>

          {/* Progress bar */}
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(event.current_players / event.max_players) * 100}%`,
                  backgroundColor: isFull ? colors.accentRed : colors.primary,
                },
              ]}
            />
          </View>

          {/* Participant list */}
          <View style={styles.participantsList}>
            {participants.map((p) => (
              <View key={p.id} style={styles.participantRow}>
                <View style={styles.participantAvatar}>
                  <Text style={styles.participantAvatarText}>
                    {p.User?.name?.charAt(0)?.toUpperCase() || '?'}
                  </Text>
                </View>
                <Text style={styles.participantName}>{p.User?.name || 'Unknown'}</Text>
                {p.user_id === event.creator_id && (
                  <View style={styles.organizerBadge}>
                    <Text style={styles.organizerBadgeText}>{t('gametime.organizer')}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Organizer */}
        {event.Creator && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('gametime.organizer')}</Text>
            <View style={styles.organizerRow}>
              <View style={styles.organizerAvatar}>
                <Text style={styles.organizerAvatarText}>
                  {event.Creator.name?.charAt(0)?.toUpperCase() || '?'}
                </Text>
              </View>
              <View>
                <Text style={styles.organizerName}>{event.Creator.name}</Text>
                {event.Creator.city && (
                  <Text style={styles.organizerCity}>📍 {event.Creator.city}</Text>
                )}
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Action button */}
      {event.status === 'upcoming' && !event.is_creator && (
        <View style={styles.actionBar}>
          {event.is_joined ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.leaveButton]}
              onPress={handleLeave}
              disabled={actionLoading}
              activeOpacity={0.7}
            >
              <Text style={styles.leaveButtonText}>
                {actionLoading ? t('common.loading') : t('gametime.leave')}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, styles.joinButton, isFull && styles.disabledButton]}
              onPress={handleJoin}
              disabled={actionLoading || isFull}
              activeOpacity={0.7}
            >
              <Text style={styles.joinButtonText}>
                {actionLoading ? t('common.loading') : isFull ? t('gametime.full') : t('gametime.join')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  headerBar: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
    paddingTop: 52,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: { paddingVertical: spacing.xs },
  backText: { fontSize: fontSize.lg, fontWeight: fontWeight.medium, color: colors.primary },
  cancelHeaderBtn: { paddingVertical: spacing.xs },
  cancelHeaderText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.accentRed },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: fontSize.lg, color: colors.textSecondary },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.xl, paddingTop: spacing.xxl, paddingBottom: 120 },

  // Hero
  heroSection: { alignItems: 'center', marginBottom: spacing.xxl },
  heroEmoji: { fontSize: 56, marginBottom: spacing.md },
  heroTitle: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  heroBadges: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  typeBadge: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.pill },
  typeBadgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: '#FFFFFF' },
  skillBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.chipBackground,
  },
  skillBadgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.chipText },

  // Cards
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cardTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.textPrimary, marginBottom: spacing.md },

  detailRow: { flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.sm },
  detailIcon: { fontSize: 20, marginTop: 2 },
  detailLabel: { fontSize: fontSize.xs, color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5 },
  detailValue: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.textPrimary, marginTop: 2 },
  detailSub: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  separator: { height: 1, backgroundColor: colors.separator, marginVertical: spacing.xs },

  descriptionText: { fontSize: fontSize.base, color: colors.textSecondary, lineHeight: 22 },
  notesText: { fontSize: fontSize.base, color: colors.textSecondary, lineHeight: 22, fontStyle: 'italic' },

  // Players
  playersHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  spotsText: { fontSize: fontSize.sm, color: colors.accentGreen, fontWeight: fontWeight.medium },
  spotsTextFull: { color: colors.accentRed },
  progressBar: { height: 6, backgroundColor: colors.chipBackground, borderRadius: 3, marginBottom: spacing.lg },
  progressFill: { height: 6, borderRadius: 3 },

  participantsList: { gap: spacing.sm },
  participantRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  participantAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  participantAvatarText: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.primary },
  participantName: { fontSize: fontSize.base, color: colors.textPrimary, flex: 1 },
  organizerBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
  },
  organizerBadgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.textPrimary },

  // Organizer card
  organizerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  organizerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  organizerAvatarText: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.primary },
  organizerName: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  organizerCity: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },

  // Action bar
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    ...shadow.md,
  },
  actionButton: { paddingVertical: spacing.lg, borderRadius: borderRadius.sm, alignItems: 'center' },
  joinButton: { backgroundColor: colors.primary },
  joinButtonText: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textInverse },
  leaveButton: { borderWidth: 1.5, borderColor: colors.accentRed },
  leaveButtonText: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.accentRed },
  disabledButton: { backgroundColor: colors.chipBackground },
});

export default GametimeDetailScreen;
