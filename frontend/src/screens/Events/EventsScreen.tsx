import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, fontSize, fontWeight } from '../../theme';
import { eventsApi, EventItem } from '../../services/events';
import { SPORTS } from '../../utils/constants';

const EVENT_TYPE_LABELS: Record<string, string> = {
  tournament: 'Tournament',
  meetup: 'Meetup',
  league: 'League',
};

const EventsScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sportFilter, setSportFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const params: any = { status: 'open', limit: 30 };
      if (sportFilter) params.sport = sportFilter;
      if (typeFilter) params.event_type = typeFilter;
      const res = await eventsApi.list(params);
      setEvents(res.events);
      setTotal(res.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [sportFilter, typeFilter]);

  useEffect(() => { load(); }, [load]);

  const formatDate = (s: string) => new Date(s).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  const formatTime = (s: string) => new Date(s).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  const renderItem = ({ item, index }: { item: EventItem; index: number }) => {
    const isAlt = index % 2 === 1;
    const bg = isAlt ? colors.cardAltBackground : colors.cardBackground;
    const border = isAlt ? colors.cardAltBorder : colors.cardBorder;
    const t1 = isAlt ? colors.cardAltTextPrimary : colors.textPrimary;
    const t2 = isAlt ? colors.cardAltTextSecondary : colors.textSecondary;
    const count = item.registered_count ?? 0;
    const full = count >= item.max_participants;

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: bg, borderColor: border }]}
        onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
        activeOpacity={0.7}
      >
        <View style={styles.cardRow}>
          <Text style={[styles.title, { color: t1 }]} numberOfLines={1}>{item.title}</Text>
          <View style={[styles.typeChip, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.typeChipText, { color: colors.primary }]}>{EVENT_TYPE_LABELS[item.event_type] || item.event_type}</Text>
          </View>
        </View>
        <Text style={[styles.sport, { color: t2 }]}>{item.sport_name}</Text>
        <View style={styles.meta}>
          <Text style={[styles.metaText, { color: t2 }]}>{formatDate(item.start_time)} · {formatTime(item.start_time)}</Text>
        </View>
        {item.city && <Text style={[styles.city, { color: t2 }]}>{item.city}</Text>}
        <Text style={[styles.count, { color: t2 }]}>{count}/{item.max_participants} registered {full && '(Full)'}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <View style={[styles.filters, { backgroundColor: colors.background }]}>
        <FlatList
          horizontal
          data={['All', ...SPORTS.slice(0, 8)]}
          keyExtractor={(s) => s}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.chip, { backgroundColor: colors.chipBackground }, sportFilter === (item === 'All' ? null : item) && { backgroundColor: colors.primaryLight, borderColor: colors.primary, borderWidth: 1 }]}
              onPress={() => setSportFilter(item === 'All' ? null : item)}
            >
              <Text style={[styles.chipText, { color: colors.textSecondary }, sportFilter === (item === 'All' ? null : item) && { color: colors.primary, fontWeight: fontWeight.semibold }]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
        <View style={styles.typeRow}>
          {(['meetup', 'tournament', 'league'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.typeBtn, { backgroundColor: colors.chipBackground }, typeFilter === t && { backgroundColor: colors.primaryLight }]}
              onPress={() => setTypeFilter(typeFilter === t ? null : t)}
            >
              <Text style={[styles.typeBtnText, { color: colors.textSecondary }, typeFilter === t && { color: colors.primary }]}>{EVENT_TYPE_LABELS[t]}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {loading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}
          ListEmptyComponent={<Text style={[styles.empty, { color: colors.textTertiary }]}>No events right now</Text>}
        />
      )}
      <TouchableOpacity style={[styles.myEventsBtn, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('MyEvents')}>
        <Text style={styles.myEventsBtnText}>My events</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  filters: { paddingVertical: spacing.sm },
  chipList: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, marginRight: spacing.sm },
  chipText: { fontSize: fontSize.sm },
  typeRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, gap: spacing.sm },
  typeBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.sm },
  typeBtnText: { fontSize: fontSize.xs },
  list: { padding: spacing.lg, paddingBottom: 100 },
  card: { padding: spacing.lg, borderRadius: borderRadius.md, marginBottom: spacing.md, borderWidth: 1 },
  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, flex: 1 },
  typeChip: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
  typeChipText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  sport: { fontSize: fontSize.sm, marginTop: spacing.xs },
  meta: { marginTop: spacing.xs },
  metaText: { fontSize: fontSize.sm },
  city: { fontSize: fontSize.xs, marginTop: 2 },
  count: { fontSize: fontSize.xs, marginTop: spacing.xs },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { textAlign: 'center', padding: spacing.xl },
  myEventsBtn: { position: 'absolute', bottom: spacing.lg, left: spacing.lg, right: spacing.lg, paddingVertical: spacing.md, borderRadius: borderRadius.sm, alignItems: 'center' },
  myEventsBtnText: { color: '#FFF', fontWeight: fontWeight.semibold },
});

export default EventsScreen;
