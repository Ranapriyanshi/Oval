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
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, fontSize, fontWeight, shadow } from '../../theme';
import { gametimeApi, GametimeEvent } from '../../services/gametime';

const SPORT_EMOJIS: Record<string, string> = {
  tennis: '🎾', basketball: '🏀', soccer: '⚽', football: '🏈',
  cricket: '🏏', swimming: '🏊', running: '🏃', cycling: '🚴',
  volleyball: '🏐', badminton: '🏸', golf: '⛳', hockey: '🏒',
  rugby: '🏉', surfing: '🏄', yoga: '🧘', gym: '🏋️', hiking: '🥾',
};

type RouteParams = { GametimeDetail: { eventId: string } };

const GametimeDetailScreen = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, 'GametimeDetail'>>();
  const { eventId } = route.params;

  const EVENT_TYPE_COLORS: Record<string, string> = {
    casual: colors.accentGreen,
    competitive: colors.primary,
    training: colors.accent,
  };

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
      <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
        <View style={[styles.headerBar, { backgroundColor: colors.background, borderBottomColor: colors.borderLight }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
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
      <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
        <View style={[styles.headerBar, { backgroundColor: colors.background, borderBottomColor: colors.borderLight }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>{t('common.error')}</Text>
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
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <View style={[styles.headerBar, { backgroundColor: colors.background, borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        {event.is_creator && event.status === 'upcoming' && (
          <TouchableOpacity onPress={handleCancel} style={styles.cancelHeaderBtn}>
            <Text style={[styles.cancelHeaderText, { color: colors.accentRed }]}>{t('gametime.cancelEvent')}</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroSection}>
          <Text style={styles.heroEmoji}>{sportEmoji}</Text>
          <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>{event.title}</Text>
          <View style={styles.heroBadges}>
            <View style={[styles.typeBadge, { backgroundColor: typeColor }]}>
              <Text style={styles.typeBadgeText}>
                {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}
              </Text>
            </View>
            {event.skill_level !== 'any' && (
              <View style={[styles.skillBadge, { backgroundColor: colors.chipBackground }]}>
                <Text style={[styles.skillBadgeText, { color: colors.chipText }]}>
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
        <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📅</Text>
            <View>
              <Text style={[styles.detailLabel, { color: colors.textTertiary }]}>{t('gametime.dateTime')}</Text>
              <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{formatDateTime(event.start_time)}</Text>
              <Text style={[styles.detailSub, { color: colors.textSecondary }]}>
                {formatTime(event.start_time)} – {formatTime(event.end_time)}
              </Text>
            </View>
          </View>

          {(event.venue_name || event.address) && (
            <>
              <View style={[styles.separator, { backgroundColor: colors.separator }]} />
              <View style={styles.detailRow}>
                <Text style={styles.detailIcon}>📍</Text>
                <View>
                  <Text style={[styles.detailLabel, { color: colors.textTertiary }]}>{t('gametime.location')}</Text>
                  {event.venue_name && <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{event.venue_name}</Text>}
                  {event.address && <Text style={[styles.detailSub, { color: colors.textSecondary }]}>{event.address}</Text>}
                </View>
              </View>
            </>
          )}

          <View style={[styles.separator, { backgroundColor: colors.separator }]} />
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>💰</Text>
            <View>
              <Text style={[styles.detailLabel, { color: colors.textTertiary }]}>{t('gametime.cost')}</Text>
              <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                {formatCost(event.cost_per_person_cents, event.currency)}
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        {event.description && (
          <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{t('gametime.about')}</Text>
            <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>{event.description}</Text>
          </View>
        )}

        {/* Notes */}
        {event.notes && (
          <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{t('gametime.notes')}</Text>
            <Text style={[styles.notesText, { color: colors.textSecondary }]}>{event.notes}</Text>
          </View>
        )}

        {/* Players */}
        <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
          <View style={styles.playersHeader}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
              {t('gametime.players')} ({event.current_players}/{event.max_players})
            </Text>
            <Text style={[styles.spotsText, { color: isFull ? colors.accentRed : colors.accentGreen }]}>
              {isFull ? t('gametime.full') : `${spotsLeft} ${t('gametime.spotsLeft')}`}
            </Text>
          </View>

          {/* Progress bar */}
          <View style={[styles.progressBar, { backgroundColor: colors.chipBackground }]}>
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
                <View style={[styles.participantAvatar, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.participantAvatarText, { color: colors.primary }]}>
                    {p.User?.name?.charAt(0)?.toUpperCase() || '?'}
                  </Text>
                </View>
                <Text style={[styles.participantName, { color: colors.textPrimary }]}>{p.User?.name || 'Unknown'}</Text>
                {p.user_id === event.creator_id && (
                  <View style={[styles.organizerBadge, { backgroundColor: colors.accent }]}>
                    <Text style={[styles.organizerBadgeText, { color: colors.textPrimary }]}>{t('gametime.organizer')}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Organizer */}
        {event.Creator && (
          <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{t('gametime.organizer')}</Text>
            <View style={styles.organizerRow}>
              <View style={[styles.organizerAvatar, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.organizerAvatarText, { color: colors.primary }]}>
                  {event.Creator.name?.charAt(0)?.toUpperCase() || '?'}
                </Text>
              </View>
              <View>
                <Text style={[styles.organizerName, { color: colors.textPrimary }]}>{event.Creator.name}</Text>
                {event.Creator.city && (
                  <Text style={[styles.organizerCity, { color: colors.textSecondary }]}>📍 {event.Creator.city}</Text>
                )}
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Action button */}
      {event.status === 'upcoming' && !event.is_creator && (
        <View style={[styles.actionBar, { backgroundColor: colors.background, borderTopColor: colors.borderLight }]}>
          {event.is_joined ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.leaveButton, { borderColor: colors.accentRed }]}
              onPress={handleLeave}
              disabled={actionLoading}
              activeOpacity={0.7}
            >
              <Text style={[styles.leaveButtonText, { color: colors.accentRed }]}>
                {actionLoading ? t('common.loading') : t('gametime.leave')}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: isFull ? colors.chipBackground : colors.primary }]}
              onPress={handleJoin}
              disabled={actionLoading || isFull}
              activeOpacity={0.7}
            >
              <Text style={[styles.joinButtonText, { color: colors.textInverse }]}>
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
  container: { flex: 1 },
  headerBar: {
    paddingHorizontal: spacing.xl,
    paddingTop: 52,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: { paddingVertical: spacing.xs },
  backText: { fontSize: fontSize.lg, fontWeight: fontWeight.medium },
  cancelHeaderBtn: { paddingVertical: spacing.xs },
  cancelHeaderText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: fontSize.lg },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.xl, paddingTop: spacing.xxl, paddingBottom: 120 },

  // Hero
  heroSection: { alignItems: 'center', marginBottom: spacing.xxl },
  heroEmoji: { fontSize: 56, marginBottom: spacing.md },
  heroTitle: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },
  heroBadges: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  typeBadge: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.pill },
  typeBadgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: '#FFFFFF' },
  skillBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
  },
  skillBadgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },

  // Cards
  card: {
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
  },
  cardTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, marginBottom: spacing.md },

  detailRow: { flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.sm },
  detailIcon: { fontSize: 20, marginTop: 2 },
  detailLabel: { fontSize: fontSize.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  detailValue: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, marginTop: 2 },
  detailSub: { fontSize: fontSize.sm, marginTop: 2 },
  separator: { height: 1, marginVertical: spacing.xs },

  descriptionText: { fontSize: fontSize.base, lineHeight: 22 },
  notesText: { fontSize: fontSize.base, lineHeight: 22, fontStyle: 'italic' },

  // Players
  playersHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  spotsText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  progressBar: { height: 6, borderRadius: 3, marginBottom: spacing.lg },
  progressFill: { height: 6, borderRadius: 3 },

  participantsList: { gap: spacing.sm },
  participantRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  participantAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  participantAvatarText: { fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  participantName: { fontSize: fontSize.base, flex: 1 },
  organizerBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
  },
  organizerBadgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },

  // Organizer card
  organizerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  organizerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  organizerAvatarText: { fontSize: fontSize.lg, fontWeight: fontWeight.bold },
  organizerName: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold },
  organizerCity: { fontSize: fontSize.sm, marginTop: 2 },

  // Action bar
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    borderTopWidth: 1,
    ...shadow.md,
  },
  actionButton: { paddingVertical: spacing.lg, borderRadius: borderRadius.sm, alignItems: 'center' },
  joinButtonText: { fontSize: fontSize.lg, fontWeight: fontWeight.bold },
  leaveButton: { borderWidth: 1.5 },
  leaveButtonText: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold },
});

export default GametimeDetailScreen;
