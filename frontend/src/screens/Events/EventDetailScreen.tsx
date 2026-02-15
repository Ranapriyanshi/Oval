import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, fontSize, fontWeight } from '../../theme';
import { eventsApi, EventItem } from '../../services/events';

export default function EventDetailScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<{ params: { eventId: string } }>();
  const eventId = route.params?.eventId;
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    eventsApi.getById(eventId).then(setEvent).catch(() => {}).finally(() => setLoading(false));
  }, [eventId]);

  const refresh = () => eventId && eventsApi.getById(eventId).then(setEvent);

  const handleRegister = async () => {
    if (!event) return;
    setActionLoading(true);
    try {
      await eventsApi.register(event.id);
      await refresh();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to register');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnregister = async () => {
    if (!event) return;
    Alert.alert('Unregister', 'Leave this event?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(true);
          try {
            await eventsApi.unregister(event.id);
            await refresh();
          } catch (e: any) {
            Alert.alert('Error', e.response?.data?.message || 'Failed');
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  if (loading || !event) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.backgroundSecondary }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const formatDate = (s: string) => new Date(s).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const formatTime = (s: string) => new Date(s).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  const registered = event.registered_count ?? 0;
  const full = registered >= event.max_participants;
  const isRegistered = event.is_registered;

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{event.title}</Text>
        <View style={[styles.badge, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.badgeText, { color: colors.primary }]}>{event.event_type}</Text>
        </View>
        <Text style={[styles.sport, { color: colors.textSecondary }]}>{event.sport_name}</Text>
        {event.description ? <Text style={[styles.desc, { color: colors.textSecondary }]}>{event.description}</Text> : null}
        <View style={[styles.section, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>When</Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>{formatDate(event.start_time)}</Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>{formatTime(event.start_time)} – {formatTime(event.end_time)}</Text>
        </View>
        {(event.city || event.address) && (
          <View style={[styles.section, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Where</Text>
            <Text style={[styles.body, { color: colors.textSecondary }]}>{[event.address, event.city, event.country].filter(Boolean).join(', ')}</Text>
          </View>
        )}
        <View style={[styles.section, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Participants</Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>{registered} / {event.max_participants}</Text>
        </View>
      </ScrollView>
      {event.status === 'open' && (
        <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.borderLight }]}>
          {isRegistered ? (
            <TouchableOpacity style={[styles.btn, { borderColor: colors.accentRed }]} onPress={handleUnregister} disabled={actionLoading}>
              <Text style={[styles.btnText, { color: colors.accentRed }]}>{actionLoading ? '...' : 'Unregister'}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.btn, { backgroundColor: full ? colors.chipBackground : colors.primary }]} onPress={handleRegister} disabled={actionLoading || full}>
              <Text style={[styles.btnText, { color: full ? colors.textSecondary : '#FFF' }]}>{actionLoading ? '...' : full ? 'Full' : 'Register'}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.xl, paddingBottom: 100 },
  title: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, marginBottom: spacing.sm },
  badge: { alignSelf: 'flex-start', paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.sm, marginBottom: spacing.sm },
  badgeText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  sport: { fontSize: fontSize.base, marginBottom: spacing.md },
  desc: { fontSize: fontSize.base, marginBottom: spacing.lg },
  section: { padding: spacing.lg, borderRadius: borderRadius.md, borderWidth: 1, marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, marginBottom: spacing.sm },
  body: { fontSize: fontSize.base },
  footer: { padding: spacing.lg, borderTopWidth: 1 },
  btn: { paddingVertical: spacing.lg, borderRadius: borderRadius.sm, alignItems: 'center' },
  btnText: { fontSize: fontSize.base, fontWeight: fontWeight.semibold },
});
