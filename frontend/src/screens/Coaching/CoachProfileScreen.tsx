import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import coachingApi, { CoachItem } from '../../services/coaching';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadow } from '../../theme';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CoachProfileScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { coachId } = route.params;

  const [coach, setCoach] = useState<CoachItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Booking form state
  const [showBooking, setShowBooking] = useState(false);
  const [bookSport, setBookSport] = useState('');
  const [bookDate, setBookDate] = useState('');
  const [bookTime, setBookTime] = useState('');
  const [bookDuration, setBookDuration] = useState('60');
  const [bookNotes, setBookNotes] = useState('');
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    loadCoach();
  }, [coachId]);

  const loadCoach = async () => {
    try {
      const data = await coachingApi.getCoach(coachId);
      setCoach(data);
      if (data.specializations.length > 0) {
        setBookSport(data.specializations[0]);
      }
    } catch (error) {
      console.error('Failed to load coach:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    if (!bookDate || !bookTime || !bookSport) {
      Alert.alert('Missing info', 'Please fill in sport, date, and time.');
      return;
    }
    setBooking(true);
    try {
      await coachingApi.bookSession(coachId, {
        sport: bookSport,
        session_date: bookDate,
        start_time: bookTime,
        duration_minutes: parseInt(bookDuration) || 60,
        notes: bookNotes || undefined,
      });
      Alert.alert(
        t('coaching.booked', 'Session Booked!'),
        t('coaching.bookedMessage', 'Your coaching session has been requested. The coach will confirm shortly.'),
        [{ text: 'OK', onPress: () => { setShowBooking(false); navigation.navigate('MySessions'); } }]
      );
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to book session';
      Alert.alert('Error', msg);
    } finally {
      setBooking(false);
    }
  };

  const renderStars = (rating: number) => {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
      stars += i <= Math.floor(rating) ? '★' : '☆';
    }
    return stars;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!coach) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Coach not found</Text>
      </View>
    );
  }

  const cost = ((Number(coach.hourly_rate) * (parseInt(bookDuration) || 60)) / 60).toFixed(2);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {coach.User?.name?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </View>
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.coachName}>{coach.User?.name}</Text>
            {coach.is_verified && <Text style={styles.verifiedBadge}>✓</Text>}
          </View>
          <Text style={styles.coachCity}>📍 {coach.city || coach.User?.city}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.stars}>{renderStars(Number(coach.rating_avg))}</Text>
            <Text style={styles.ratingText}>
              {Number(coach.rating_avg).toFixed(1)} ({coach.rating_count} {t('coaching.reviews', 'reviews')})
            </Text>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{coach.experience_years}</Text>
          <Text style={styles.statLabel}>{t('coaching.yearsExp', 'Years Exp.')}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{coach.total_sessions}</Text>
          <Text style={styles.statLabel}>{t('coaching.sessions', 'Sessions')}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>${Number(coach.hourly_rate).toFixed(0)}</Text>
          <Text style={styles.statLabel}>{t('coaching.perHour', '/hour')}</Text>
        </View>
      </View>

      {/* Bio */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('coaching.about', 'About')}</Text>
        <Text style={styles.bioText}>{coach.bio}</Text>
      </View>

      {/* Specializations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('coaching.specializations', 'Specializations')}</Text>
        <View style={styles.chipWrap}>
          {coach.specializations.map((spec) => (
            <View key={spec} style={styles.specChip}>
              <Text style={styles.specChipText}>{spec}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Certifications */}
      {coach.certifications.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('coaching.certifications', 'Certifications')}</Text>
          {coach.certifications.map((cert, i) => (
            <View key={i} style={styles.certRow}>
              <Text style={styles.certIcon}>📜</Text>
              <Text style={styles.certText}>{cert}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Availability */}
      {coach.Availabilities && coach.Availabilities.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('coaching.availability', 'Availability')}</Text>
          {Array.from(new Set(coach.Availabilities.map((a) => a.day_of_week)))
            .sort()
            .map((day) => {
              const slots = coach.Availabilities!.filter((a) => a.day_of_week === day);
              return (
                <View key={day} style={styles.availRow}>
                  <Text style={styles.availDay}>{DAY_NAMES[day]}</Text>
                  <View style={styles.availSlots}>
                    {slots.map((s) => (
                      <Text key={s.id} style={styles.availTime}>
                        {s.start_time} - {s.end_time}
                      </Text>
                    ))}
                  </View>
                </View>
              );
            })}
        </View>
      )}

      {/* Reviews */}
      {coach.Ratings && coach.Ratings.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('coaching.recentReviews', 'Recent Reviews')}</Text>
          {coach.Ratings.map((r) => (
            <View key={r.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewName}>{r.User?.name || 'Anonymous'}</Text>
                <Text style={styles.reviewStars}>{renderStars(r.rating)}</Text>
              </View>
              {r.review && <Text style={styles.reviewText}>{r.review}</Text>}
            </View>
          ))}
        </View>
      )}

      {/* Book Button */}
      {!showBooking ? (
        <TouchableOpacity style={styles.bookButton} onPress={() => setShowBooking(true)} activeOpacity={0.7}>
          <Text style={styles.bookButtonText}>
            {t('coaching.bookSession', 'Book a Session')} - ${Number(coach.hourly_rate).toFixed(0)}/hr
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.bookingForm}>
          <Text style={styles.sectionTitle}>{t('coaching.bookSession', 'Book a Session')}</Text>

          <Text style={styles.fieldLabel}>{t('coaching.sport', 'Sport')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sportPicker}>
            {coach.specializations.map((spec) => (
              <TouchableOpacity
                key={spec}
                style={[styles.sportOption, bookSport === spec && styles.sportOptionActive]}
                onPress={() => setBookSport(spec)}
              >
                <Text style={[styles.sportOptionText, bookSport === spec && styles.sportOptionTextActive]}>
                  {spec}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.fieldLabel}>{t('coaching.date', 'Date')} (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={bookDate}
            onChangeText={setBookDate}
            placeholder="2026-02-20"
            placeholderTextColor={colors.textTertiary}
          />

          <Text style={styles.fieldLabel}>{t('coaching.time', 'Start Time')} (HH:MM)</Text>
          <TextInput
            style={styles.input}
            value={bookTime}
            onChangeText={setBookTime}
            placeholder="10:00"
            placeholderTextColor={colors.textTertiary}
          />

          <Text style={styles.fieldLabel}>{t('coaching.duration', 'Duration (minutes)')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sportPicker}>
            {['30', '60', '90', '120'].map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.sportOption, bookDuration === d && styles.sportOptionActive]}
                onPress={() => setBookDuration(d)}
              >
                <Text style={[styles.sportOptionText, bookDuration === d && styles.sportOptionTextActive]}>
                  {d} min
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.fieldLabel}>{t('coaching.notes', 'Notes (optional)')}</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            value={bookNotes}
            onChangeText={setBookNotes}
            placeholder="Any specific focus areas..."
            placeholderTextColor={colors.textTertiary}
            multiline
          />

          <Text style={styles.costPreview}>
            {t('coaching.estimatedCost', 'Estimated cost')}: ${cost} {coach.currency}
          </Text>

          <View style={styles.bookActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowBooking(false)}>
              <Text style={styles.cancelBtnText}>{t('common.cancel', 'Cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, booking && styles.confirmBtnDisabled]}
              onPress={handleBook}
              disabled={booking}
            >
              {booking ? (
                <ActivityIndicator size="small" color={colors.textInverse} />
              ) : (
                <Text style={styles.confirmBtnText}>{t('coaching.confirmBooking', 'Confirm Booking')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  content: { paddingBottom: spacing.xxxl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.backgroundSecondary },
  errorText: { fontSize: fontSize.lg, color: colors.textSecondary },

  // Header
  profileHeader: {
    backgroundColor: colors.background,
    padding: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 28, fontWeight: fontWeight.bold, color: colors.primary },
  headerInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  coachName: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.textPrimary },
  verifiedBadge: {
    fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.textInverse,
    backgroundColor: colors.accentGreen, borderRadius: 10,
    width: 20, height: 20, textAlign: 'center', lineHeight: 20, overflow: 'hidden',
  },
  coachCity: { fontSize: fontSize.base, color: colors.textSecondary, marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs },
  stars: { fontSize: fontSize.base, color: colors.accent },
  ratingText: { fontSize: fontSize.sm, color: colors.textSecondary },

  // Stats
  statsRow: {
    flexDirection: 'row', backgroundColor: colors.background,
    marginTop: 1, paddingVertical: spacing.lg, paddingHorizontal: spacing.xl,
    justifyContent: 'space-around', alignItems: 'center',
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.primary },
  statLabel: { fontSize: fontSize.xs, color: colors.textTertiary, marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: colors.separator },

  // Section
  section: {
    backgroundColor: colors.background,
    marginTop: spacing.sm,
    padding: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  bioText: { fontSize: fontSize.base, color: colors.textSecondary, lineHeight: 22 },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  specChip: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.pill,
  },
  specChipText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.primary },

  certRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  certIcon: { fontSize: 16 },
  certText: { fontSize: fontSize.base, color: colors.textSecondary, flex: 1 },

  // Availability
  availRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.separator,
  },
  availDay: { width: 40, fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  availSlots: { flexDirection: 'row', gap: spacing.md, flex: 1 },
  availTime: { fontSize: fontSize.sm, color: colors.textSecondary },

  // Reviews
  reviewCard: {
    backgroundColor: colors.backgroundSecondary, borderRadius: borderRadius.sm,
    padding: spacing.md, marginBottom: spacing.sm,
  },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  reviewName: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  reviewStars: { fontSize: fontSize.sm, color: colors.accent },
  reviewText: { fontSize: fontSize.md, color: colors.textSecondary, lineHeight: 18 },

  // Book button
  bookButton: {
    backgroundColor: colors.primary,
    marginHorizontal: spacing.xl, marginTop: spacing.lg,
    paddingVertical: spacing.md + 2,
    borderRadius: borderRadius.pill, alignItems: 'center',
  },
  bookButtonText: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.textInverse },

  // Booking form
  bookingForm: {
    backgroundColor: colors.background,
    marginTop: spacing.sm, padding: spacing.xl,
  },
  fieldLabel: {
    fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textPrimary,
    marginTop: spacing.md, marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.sm, paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2, fontSize: fontSize.base, color: colors.textPrimary,
  },
  inputMultiline: { minHeight: 60, textAlignVertical: 'top' },
  sportPicker: { marginBottom: spacing.xs },
  sportOption: {
    backgroundColor: colors.chipBackground,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.pill, marginRight: spacing.sm,
  },
  sportOptionActive: { backgroundColor: colors.primary },
  sportOptionText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.chipText },
  sportOptionTextActive: { color: colors.textInverse },
  costPreview: {
    fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.primary,
    textAlign: 'center', marginTop: spacing.lg,
  },
  bookActions: {
    flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg,
  },
  cancelBtn: {
    flex: 1, paddingVertical: spacing.md,
    borderRadius: borderRadius.pill, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center',
  },
  cancelBtnText: { fontSize: fontSize.base, fontWeight: fontWeight.medium, color: colors.textSecondary },
  confirmBtn: {
    flex: 2, paddingVertical: spacing.md,
    borderRadius: borderRadius.pill, backgroundColor: colors.primary,
    alignItems: 'center',
  },
  confirmBtnDisabled: { opacity: 0.6 },
  confirmBtnText: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.textInverse },
});

export default CoachProfileScreen;
