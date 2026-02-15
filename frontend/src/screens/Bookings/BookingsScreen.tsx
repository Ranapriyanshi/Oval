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
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, fontSize, fontWeight } from '../../theme';

const BookingsScreen = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
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

  const renderBooking = ({ item, index }: { item: BookingItem; index: number }) => {
    const start = new Date(item.start_time);
    const end = new Date(item.end_time);
    const isPast = end < new Date();
    const isCancelled = item.status === 'cancelled';
    const isAlt = index % 2 === 1;
    const bg = isAlt ? colors.cardAltBackground : colors.cardBackground;
    const border = isAlt ? colors.cardAltBorder : colors.cardBorder;
    const t1 = isAlt ? colors.cardAltTextPrimary : colors.textPrimary;
    const t2 = isAlt ? colors.cardAltTextSecondary : colors.textSecondary;
    const t3 = isAlt ? colors.cardAltTextSecondary : colors.textTertiary;

    return (
      <View style={[styles.card, { backgroundColor: bg, borderColor: border }, isCancelled && styles.cardCancelled]}>
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={[styles.sportBadge, { backgroundColor: isAlt ? 'rgba(255,255,255,0.25)' : colors.primaryLight }]}>
              <Text style={[styles.sportBadgeText, { color: isAlt ? colors.textInverse : colors.primary }]}>{item.sport_name.charAt(0)}</Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={[styles.venueName, { color: t1 }]}>{item.Venue?.name ?? 'Venue'}</Text>
              <Text style={[styles.address, { color: t2 }]}>{item.Venue?.address}</Text>
            </View>
            {isCancelled && (
              <View style={styles.statusChip}>
                <Text style={[styles.statusChipText, { color: colors.accentRed }]}>{t('bookings.cancelled')}</Text>
              </View>
            )}
          </View>

          <View style={[styles.separator, { backgroundColor: isAlt ? 'rgba(255,255,255,0.2)' : colors.separator }]} />

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: t3 }]}>Sport</Text>
              <Text style={[styles.detailValue, { color: t1 }]}>{item.sport_name}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: t3 }]}>Date</Text>
              <Text style={[styles.detailValue, { color: t1 }]}>
                {start.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: t3 }]}>Time</Text>
              <Text style={[styles.detailValue, { color: t1 }]}>
                {start.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: t3 }]}>Price</Text>
              <Text style={[styles.priceValue, { color: isAlt ? colors.textInverse : colors.primary }]}>
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
              <Text style={[styles.cancelButtonText, { color: colors.accentRed }]}>{t('bookings.cancelBooking')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.borderLight }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{t('bookings.title')}</Text>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggle, { backgroundColor: colors.chipBackground }, upcomingOnly && { backgroundColor: colors.chipSelectedBackground }]}
            onPress={() => setUpcomingOnly(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.toggleText, { color: colors.chipText }, upcomingOnly && { color: colors.chipSelectedText }]}>
              {t('bookings.upcoming')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggle, { backgroundColor: colors.chipBackground }, !upcomingOnly && { backgroundColor: colors.chipSelectedBackground }]}
            onPress={() => setUpcomingOnly(false)}
            activeOpacity={0.7}
          >
            <Text style={[styles.toggleText, { color: colors.chipText }, !upcomingOnly && { color: colors.chipSelectedText }]}>
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
              <Text style={[styles.emptyText, { color: colors.textTertiary }]}>{t('bookings.noBookings')}</Text>
            </View>
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
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.md,
    letterSpacing: -0.3,
  },
  toggleRow: { flexDirection: 'row', gap: spacing.sm },
  toggle: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.pill,
  },
  toggleText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
  list: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  card: {
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
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
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  sportBadgeText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  cardInfo: { flex: 1 },
  venueName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  address: {
    fontSize: fontSize.md,
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
  },
  separator: {
    height: 1,
    marginBottom: spacing.md,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: { alignItems: 'center' },
  detailLabel: {
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    fontWeight: fontWeight.medium,
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
  priceValue: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  cancelButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
  },
  cancelButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xxxl },
  emptyIcon: { fontSize: 40, marginBottom: spacing.md },
  emptyText: { fontSize: fontSize.lg },
});

export default BookingsScreen;
