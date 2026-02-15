import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, fontSize, fontWeight } from '../../theme';
import { eventsApi, EventItem } from '../../services/events';

const MyEventsScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const res = await eventsApi.myEvents();
      setEvents(res.events || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const formatDate = (s: string) => new Date(s).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

  const renderItem = ({ item, index }: { item: EventItem; index: number }) => {
    const isAlt = index % 2 === 1;
    const bg = isAlt ? colors.cardAltBackground : colors.cardBackground;
    const border = isAlt ? colors.cardAltBorder : colors.cardBorder;
    const t1 = isAlt ? colors.cardAltTextPrimary : colors.textPrimary;
    const t2 = isAlt ? colors.cardAltTextSecondary : colors.textSecondary;
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: bg, borderColor: border }]}
        onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
        activeOpacity={0.7}
      >
        <Text style={[styles.title, { color: t1 }]}>{item.title}</Text>
        <Text style={[styles.sport, { color: t2 }]}>{item.sport_name} · {item.event_type}</Text>
        <Text style={[styles.date, { color: t2 }]}>{formatDate(item.start_time)}</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.backgroundSecondary }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}
        ListEmptyComponent={<Text style={[styles.empty, { color: colors.textTertiary }]}>You haven't registered for any events yet.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: spacing.lg },
  card: { padding: spacing.lg, borderRadius: borderRadius.md, borderWidth: 1, marginBottom: spacing.md },
  title: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold },
  sport: { fontSize: fontSize.sm, marginTop: spacing.xs },
  date: { fontSize: fontSize.sm, marginTop: spacing.xs },
  empty: { textAlign: 'center', padding: spacing.xl },
});

export default MyEventsScreen;
