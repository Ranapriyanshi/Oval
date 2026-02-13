import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useLocale } from '../../context/LocaleContext';
import { venuesApi, VenueListItem } from '../../services/venues';
import { formatCurrency } from '../../utils/formatting';
import { SPORTS } from '../../utils/constants';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadow } from '../../theme';

const VenuesScreen = () => {
  const { t } = useTranslation();
  const { country } = useLocale();
  const navigation = useNavigation<any>();
  const [venues, setVenues] = useState<VenueListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sportFilter, setSportFilter] = useState<string>('');
  const [cityFilter, setCityFilter] = useState('');

  const loadVenues = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const params: Record<string, string | number> = { limit: 30 };
      if (sportFilter) params.sport = sportFilter;
      if (cityFilter.trim()) params.city = cityFilter.trim();
      const res = await venuesApi.list(params);
      setVenues(res.data.venues);
    } catch (err) {
      console.error('Failed to load venues', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [sportFilter, cityFilter]);

  useEffect(() => {
    loadVenues();
  }, [loadVenues]);

  const onVenuePress = (id: string) => {
    navigation.navigate('VenueDetail', { venueId: id });
  };

  const minPrice = (v: VenueListItem) => {
    const sports = v.VenueSports;
    if (!sports?.length) return null;
    const min = Math.min(...sports.map((s) => s.hourly_rate_cents));
    return formatCurrency(min / 100, v.currency);
  };

  const renderVenue = ({ item }: { item: VenueListItem }) => {
    const priceStr = minPrice(item);
    const sportsStr = item.VenueSports?.map((s) => s.sport_name).join(', ') || '-';
    const rating = item.rating;
    const ratingStr = rating?.count
      ? `⭐ ${rating.avg} (${rating.count})`
      : t('venue.noReviews');

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => onVenuePress(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.venueIconBadge}>
              <Text style={styles.venueIcon}>🏟️</Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.venueName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.city}>{item.city}</Text>
            </View>
            <Text style={styles.ratingBadge}>{ratingStr}</Text>
          </View>
          <View style={styles.cardFooter}>
            <Text style={styles.sports} numberOfLines={1}>{sportsStr}</Text>
            {priceStr && (
              <Text style={styles.price}>
                {t('venue.from')} {priceStr}/{t('venue.perHour')}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSportChip = ({ item }: { item: string }) => {
    const isSelected = item === sportFilter || (!item && !sportFilter);
    return (
      <TouchableOpacity
        style={[styles.chip, isSelected && styles.chipSelected]}
        onPress={() => setSportFilter(item)}
        activeOpacity={0.7}
      >
        <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
          {item ? item : 'All'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('venue.title')}</Text>
        <View style={styles.searchRow}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={t('common.search') + ' city...'}
            placeholderTextColor={colors.textTertiary}
            value={cityFilter}
            onChangeText={setCityFilter}
            onSubmitEditing={() => loadVenues()}
          />
        </View>
        <FlatList
          horizontal
          data={['', ...SPORTS]}
          keyExtractor={(item) => item || 'all'}
          renderItem={renderSportChip}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={venues}
          keyExtractor={(item) => item.id}
          renderItem={renderVenue}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadVenues(true)}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyIcon}>🏟️</Text>
              <Text style={styles.emptyText}>No venues found</Text>
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },
  chipRow: {
    paddingBottom: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.chipBackground,
    marginRight: spacing.sm,
  },
  chipSelected: {
    backgroundColor: colors.chipSelectedBackground,
  },
  chipText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.chipText,
  },
  chipTextSelected: {
    color: colors.chipSelectedText,
  },
  list: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cardContent: { padding: spacing.lg },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  venueIconBadge: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  venueIcon: { fontSize: 20 },
  cardInfo: { flex: 1 },
  venueName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  city: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: 2,
  },
  ratingBadge: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.separator,
    paddingTop: spacing.md,
  },
  sports: {
    fontSize: fontSize.md,
    color: colors.textTertiary,
    flex: 1,
  },
  price: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xxxl },
  emptyIcon: { fontSize: 40, marginBottom: spacing.md },
  emptyText: { color: colors.textTertiary, fontSize: fontSize.lg },
});

export default VenuesScreen;
