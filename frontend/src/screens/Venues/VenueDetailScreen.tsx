import React, { useState, useEffect, useCallback } from 'react';
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
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { venuesApi, VenueDetail, AvailabilitySlot } from '../../services/venues';
import { bookingsApi } from '../../services/bookings';
import { formatCurrency } from '../../utils/formatting';
import { spacing, borderRadius, fontSize, fontWeight, shadow } from '../../theme';

const VenueDetailScreen = () => {
  const { t } = useTranslation();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { colors } = useTheme();
  const venueId = route.params?.venueId;

  const [venue, setVenue] = useState<VenueDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [slotLoading, setSlotLoading] = useState(false);
  const [selectedSport, setSelectedSport] = useState<string>('');
  const defaultDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();
  const [selectedDate, setSelectedDate] = useState<string>(defaultDate);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const loadVenue = useCallback(async () => {
    if (!venueId) return;
    setLoading(true);
    try {
      const res = await venuesApi.getById(venueId);
      setVenue(res.data);
      if (res.data.VenueSports?.length && !selectedSport) {
        setSelectedSport(res.data.VenueSports[0].sport_name);
      }
    } catch (err) {
      console.error('Failed to load venue', err);
    } finally {
      setLoading(false);
    }
  }, [venueId]);

  useEffect(() => {
    loadVenue();
  }, [loadVenue]);

  const loadAvailability = useCallback(async () => {
    if (!venueId || !selectedSport || !selectedDate) {
      setSlots([]);
      return;
    }
    setSlotLoading(true);
    setSelectedSlot(null);
    try {
      const res = await venuesApi.getAvailability(venueId, selectedDate, selectedSport);
      setSlots(res.data.slots || []);
    } catch (err) {
      console.error('Failed to load availability', err);
      setSlots([]);
    } finally {
      setSlotLoading(false);
    }
  }, [venueId, selectedSport, selectedDate]);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  const handleBook = async () => {
    if (!user) {
      Alert.alert(t('auth.login'), 'Please sign in to book.');
      return;
    }
    if (!selectedSlot?.available || !venue) return;
    setBookingLoading(true);
    try {
      await bookingsApi.create({
        venue_id: venueId,
        sport_name: selectedSport,
        start_time: selectedSlot.start,
        end_time: selectedSlot.end,
      });
      Alert.alert(t('venue.bookingSuccess'), '', [
        { text: 'OK', onPress: () => navigation.navigate('Main', { screen: 'Bookings' }) },
      ]);
    } catch (err: any) {
      Alert.alert(t('common.error'), err.response?.data?.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  if (!venueId) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>{t('common.error')}</Text>
      </View>
    );
  }

  if (loading || !venue) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const dateOptions = [1, 2, 3, 4, 5].map((d) => {
    const dt = new Date();
    dt.setDate(dt.getDate() + d);
    return dt.toISOString().split('T')[0];
  });
  const availableSlots = slots.filter((s) => s.available);

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>{venue.name}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Venue Info */}
        <View style={[styles.section, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
          <Text style={[styles.venueName, { color: colors.textPrimary }]}>{venue.name}</Text>
          <Text style={[styles.address, { color: colors.textSecondary }]}>{venue.address}</Text>
          <Text style={[styles.city, { color: colors.textSecondary }]}>{venue.city}</Text>
          {venue.rating?.count != null && venue.rating.count > 0 && (
            <View style={styles.ratingRow}>
              <Text style={styles.ratingStar}>⭐</Text>
              <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
                {venue.rating.avg} ({venue.rating.count} {t('venue.reviews')})
              </Text>
            </View>
          )}
          {venue.description && (
            <Text style={[styles.description, { color: colors.textSecondary }]}>{venue.description}</Text>
          )}
          {venue.amenities?.length ? (
            <View style={styles.amenitiesRow}>
              {(venue.amenities as string[]).map((a, i) => (
                <View key={i} style={[styles.amenityChip, { backgroundColor: colors.chipBackground }]}>
                  <Text style={[styles.amenityText, { color: colors.textSecondary }]}>{a}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        {/* Sports */}
        <View style={[styles.section, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('venue.sports')}</Text>
          <View style={styles.chipRow}>
            {venue.VenueSports?.map((s) => (
              <TouchableOpacity
                key={s.sport_name}
                style={[styles.chip, { backgroundColor: colors.chipBackground }, selectedSport === s.sport_name && { backgroundColor: colors.chipSelectedBackground }]}
                onPress={() => setSelectedSport(s.sport_name)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, { color: colors.chipText }, selectedSport === s.sport_name && { color: colors.chipSelectedText }]}>
                  {s.sport_name} — {formatCurrency(s.hourly_rate_cents / 100, venue.currency)}/{t('venue.perHour')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Availability */}
        <View style={[styles.section, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('venue.availability')}</Text>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('venue.selectDate')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.dateRow}>
              {dateOptions.map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.dateChip, { backgroundColor: colors.chipBackground }, selectedDate === d && { backgroundColor: colors.chipSelectedBackground }]}
                  onPress={() => setSelectedDate(d)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dateChipText, { color: colors.chipText }, selectedDate === d && { color: colors.chipSelectedText }]}>
                    {new Date(d).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <Text style={[styles.label, { marginTop: spacing.lg, color: colors.textSecondary }]}>{t('venue.selectSlot')}</Text>
          {slotLoading ? (
            <ActivityIndicator style={{ marginVertical: spacing.lg }} color={colors.primary} />
          ) : availableSlots.length === 0 ? (
            <Text style={[styles.muted, { color: colors.textTertiary }]}>{t('venue.closed')}</Text>
          ) : (
            <View style={styles.slotGrid}>
              {slots.map((slot) => {
                const isSelected = selectedSlot?.start === slot.start;
                return (
                  <TouchableOpacity
                    key={slot.start}
                    style={[
                      styles.slotChip,
                      { backgroundColor: colors.slotAvailable },
                      !slot.available && { backgroundColor: colors.slotUnavailable },
                      isSelected && { backgroundColor: colors.chipSelectedBackground },
                    ]}
                    onPress={() => slot.available && setSelectedSlot(slot)}
                    disabled={!slot.available}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.slotText,
                        { color: colors.textPrimary },
                        !slot.available && { color: colors.textTertiary },
                        isSelected && { color: colors.chipSelectedText },
                      ]}
                    >
                      {new Date(slot.start).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Book Button */}
        {selectedSlot?.available && (
          <TouchableOpacity
            style={[styles.bookButton, { backgroundColor: colors.primary }, bookingLoading && styles.bookButtonDisabled]}
            onPress={handleBook}
            disabled={bookingLoading}
            activeOpacity={0.8}
          >
            {bookingLoading ? (
              <ActivityIndicator color={colors.textInverse} />
            ) : (
              <Text style={[styles.bookButtonText, { color: colors.textInverse }]}>{t('venue.confirmBooking')}</Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 52,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.xl,
    borderBottomWidth: 1,
  },
  backButton: { width: 60 },
  backText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    flex: 1,
    textAlign: 'center',
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: fontSize.lg },
  scrollView: { flex: 1 },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: 40,
  },
  section: {
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
  },
  venueName: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
  },
  address: { fontSize: fontSize.base, marginBottom: spacing.xs },
  city: { fontSize: fontSize.base, marginBottom: spacing.md },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  ratingStar: { fontSize: 14, marginRight: spacing.xs },
  ratingText: { fontSize: fontSize.md },
  description: {
    fontSize: fontSize.base,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  amenitiesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  amenityChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.pill,
  },
  amenityText: { fontSize: fontSize.sm },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.base,
    marginBottom: spacing.sm,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.pill,
  },
  chipText: { fontSize: fontSize.md, fontWeight: fontWeight.medium },
  dateRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  dateChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.pill,
  },
  dateChipText: { fontSize: fontSize.md, fontWeight: fontWeight.medium },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  slotChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.sm,
    minWidth: 76,
    alignItems: 'center',
  },
  slotText: { fontSize: fontSize.md, fontWeight: fontWeight.medium },
  muted: { fontSize: fontSize.base },
  bookButton: {
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  bookButtonDisabled: { opacity: 0.7 },
  bookButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
});

export default VenueDetailScreen;
