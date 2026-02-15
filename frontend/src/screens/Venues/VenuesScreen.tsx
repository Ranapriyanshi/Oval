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
import { useTheme } from '../../context/ThemeContext';
import { venuesApi, VenueListItem } from '../../services/venues';
import { formatCurrency } from '../../utils/formatting';
import { SPORTS } from '../../utils/constants';
import { spacing, borderRadius, fontSize, fontWeight, shadow } from '../../theme';

const VenuesScreen = () => {
  const { t } = useTranslation();
  const { country } = useLocale();
  const { colors } = useTheme();
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

  const renderVenue = ({ item, index }: { item: VenueListItem; index: number }) => {
    const priceStr = minPrice(item);
    const sportsStr = item.VenueSports?.map((s) => s.sport_name).join(', ') || '-';
    const rating = item.rating;
    const ratingStr = rating?.count
      ? `⭐ ${rating.avg} (${rating.count})`
      : t('venue.noReviews');
    const isAlt = index % 2 === 1;
    const bg = isAlt ? colors.cardAltBackground : colors.cardBackground;
    const border = isAlt ? colors.cardAltBorder : colors.cardBorder;
    const t1 = isAlt ? colors.cardAltTextPrimary : colors.textPrimary;
    const t2 = isAlt ? colors.cardAltTextSecondary : colors.textSecondary;
    const t3 = isAlt ? colors.cardAltTextSecondary : colors.textTertiary;

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: bg, borderColor: border }]}
        onPress={() => onVenuePress(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={[styles.venueIconBadge, { backgroundColor: isAlt ? 'rgba(255,255,255,0.25)' : colors.primaryLight }]}>
              <Text style={styles.venueIcon}>🏟️</Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={[styles.venueName, { color: t1 }]} numberOfLines={1}>{item.name}</Text>
              <Text style={[styles.city, { color: t2 }]}>{item.city}</Text>
            </View>
            <Text style={[styles.ratingBadge, { color: t2 }]}>{ratingStr}</Text>
          </View>
          <View style={[styles.cardFooter, { borderTopColor: isAlt ? 'rgba(255,255,255,0.2)' : colors.separator }]}>
            <Text style={[styles.sports, { color: t3 }]} numberOfLines={1}>{sportsStr}</Text>
            {priceStr && (
              <Text style={[styles.price, { color: isAlt ? colors.textInverse : colors.primary }]}>
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
        style={[styles.chip, { backgroundColor: colors.chipBackground }, isSelected && { backgroundColor: colors.chipSelectedBackground }]}
        onPress={() => setSportFilter(item)}
        activeOpacity={0.7}
      >
        <Text style={[styles.chipText, { color: colors.chipText }, isSelected && { color: colors.chipSelectedText }]}>
          {item ? item : 'All'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.borderLight }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{t('venue.title')}</Text>
        <View style={[styles.searchRow, { backgroundColor: colors.backgroundSecondary }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
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
              <Text style={[styles.emptyText, { color: colors.textTertiary }]}>No venues found</Text>
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  chipRow: {
    paddingBottom: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.pill,
    marginRight: spacing.sm,
  },
  chipText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
  list: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  card: {
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
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
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  venueIcon: { fontSize: 20 },
  cardInfo: { flex: 1 },
  venueName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  city: {
    fontSize: fontSize.md,
    marginTop: 2,
  },
  ratingBadge: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: spacing.md,
  },
  sports: {
    fontSize: fontSize.md,
    flex: 1,
  },
  price: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xxxl },
  emptyIcon: { fontSize: 40, marginBottom: spacing.md },
  emptyText: { fontSize: fontSize.lg },
});

export default VenuesScreen;
