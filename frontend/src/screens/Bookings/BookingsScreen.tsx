import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { bookingsApi, BookingItem } from '../../services/bookings';
import { formatCurrency } from '../../utils/formatting';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme';

const BookingsScreen = () => {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [upcomingOnly, setUpcomingOnly] = useState(true);

  const loadBookings = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await bookingsApi.list({ upcoming: upcomingOnly });
      setBookings(res.data.bookings);
    } catch (err) {
      console.error('Failed to load bookings', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [upcomingOnly]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleCancel = (booking: BookingItem) => {
    Alert.alert(
      t('bookings.cancelBooking'),
      `Cancel booking at ${booking.Venue?.name}?`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              await bookingsApi.cancel(booking.id);
              setBookings((prev) => prev.filter((b) => b.id !== booking.id));
            } catch (err: any) {
              Alert.alert(t('common.error'), err.response?.data?.message || 'Failed to cancel');
            }
          },
        },
      ]
    );
  };

  const renderBooking = ({ item }: { item: BookingItem }) => {
    const start = new Date(item.start_time);
    const end = new Date(item.end_time);
    const isPast = end < new Date();
    const isCancelled = item.status === 'cancelled';

    return (
      <View style={[styles.card, isCancelled && styles.cardCancelled]}>
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.sportBadge}>
              <Text style={styles.sportBadgeText}>{item.sport_name.charAt(0)}</Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.venueName}>{item.Venue?.name ?? 'Venue'}</Text>
              <Text style={styles.address}>{item.Venue?.address}</Text>
            </View>
            {isCancelled && (
              <View style={styles.statusChip}>
                <Text style={styles.statusChipText}>{t('bookings.cancelled')}</Text>
              </View>
            )}
          </View>

          <View style={styles.separator} />

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Sport</Text>
              <Text style={styles.detailValue}>{item.sport_name}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>
                {start.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>
                {start.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Price</Text>
              <Text style={styles.priceValue}>
                {formatCurrency(item.total_cents / 100, item.currency)}
              </Text>
            </View>
          </View>

          {!isCancelled && !isPast && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handleCancel(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>{t('bookings.cancelBooking')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('bookings.title')}</Text>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggle, upcomingOnly && styles.toggleSelected]}
            onPress={() => setUpcomingOnly(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.toggleText, upcomingOnly && styles.toggleTextSelected]}>
              {t('bookings.upcoming')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggle, !upcomingOnly && styles.toggleSelected]}
            onPress={() => setUpcomingOnly(false)}
            activeOpacity={0.7}
          >
            <Text style={[styles.toggleText, !upcomingOnly && styles.toggleTextSelected]}>
              {t('bookings.past')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBooking}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadBookings(true)}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>{t('bookings.noBookings')}</Text>
            </View>
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
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  title: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    letterSpacing: -0.3,
  },
  toggleRow: { flexDirection: 'row', gap: spacing.sm },
  toggle: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.chipBackground,
  },
  toggleSelected: { backgroundColor: colors.chipSelectedBackground },
  toggleText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.chipText,
  },
  toggleTextSelected: { color: colors.chipSelectedText },
  list: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cardCancelled: { opacity: 0.6 },
  cardContent: { padding: spacing.lg },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sportBadge: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  sportBadgeText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  cardInfo: { flex: 1 },
  venueName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  address: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
    backgroundColor: '#FDE8E8',
  },
  statusChipText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.accentRed,
  },
  separator: {
    height: 1,
    backgroundColor: colors.separator,
    marginBottom: spacing.md,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: { alignItems: 'center' },
  detailLabel: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    fontWeight: fontWeight.medium,
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
  },
  priceValue: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  cancelButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
  },
  cancelButtonText: {
    fontSize: fontSize.base,
    color: colors.accentRed,
    fontWeight: fontWeight.medium,
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xxxl },
  emptyIcon: { fontSize: 40, marginBottom: spacing.md },
  emptyText: { color: colors.textTertiary, fontSize: fontSize.lg },
});

export default BookingsScreen;
