import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, fontSize, fontWeight } from '../../theme';
import { gametimeApi, GametimeParticipant } from '../../services/gametime';
import { statsApi } from '../../services/stats';

type RouteParams = { GameRating: { gameId: string } };

const GameRatingScreen = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const route = useRoute<{ params: { gameId: string } }>();
  const navigation = useNavigation<any>();
  const gameId = route.params?.gameId;

  const [title, setTitle] = useState('');
  const [participants, setParticipants] = useState<Array<GametimeParticipant & { name?: string }>>([]);
  const [ratings, setRatings] = useState<Record<string, { rating: number; sportsmanship: number }>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!gameId) return;
    (async () => {
      try {
        const res = await gametimeApi.getById(gameId);
        const event = res.data;
        setTitle(event.title || 'Game');
        const parts = (event.GametimeParticipants || []).filter(
          (p) => p.user_id !== user?.id && p.status === 'joined'
        );
        setParticipants(parts);
        const initial: Record<string, { rating: number; sportsmanship: number }> = {};
        parts.forEach((p) => {
          initial[p.user_id] = { rating: 3, sportsmanship: 3 };
        });
        setRatings(initial);
      } catch (e) {
        console.error(e);
        Alert.alert('Error', 'Could not load game');
      } finally {
        setLoading(false);
      }
    })();
  }, [gameId, user?.id]);

  const setRating = (userId: string, field: 'rating' | 'sportsmanship', value: number) => {
    setRatings((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], [field]: value },
    }));
  };

  const submit = async () => {
    if (!gameId) return;
    setSubmitting(true);
    try {
      for (const p of participants) {
        const r = ratings[p.user_id];
        if (r) await statsApi.ratePlayer(gameId, { rated_user_id: p.user_id, rating: r.rating, sportsmanship: r.sportsmanship });
      }
      Alert.alert('Thanks!', 'Your ratings have been saved.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to submit ratings');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.backgroundSecondary }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const toRate = participants.filter((p) => ratings[p.user_id]);
  const canSubmit = toRate.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Rate your fellow players (1–5)
        </Text>

        {participants.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
              No other participants to rate, or you haven't joined this game.
            </Text>
          </View>
        ) : (
          participants.map((p) => (
            <View
              key={p.user_id}
              style={[styles.playerCard, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}
            >
              <Text style={[styles.playerName, { color: colors.textPrimary }]}>
                {(p as any).User?.name || 'Player'}
              </Text>
              <View style={styles.ratingRow}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Skill / performance</Text>
                <View style={styles.stars}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <TouchableOpacity
                      key={n}
                      onPress={() => setRating(p.user_id, 'rating', n)}
                      style={[styles.starBtn, { borderColor: colors.border }]}
                    >
                      <Text style={[styles.starText, { color: colors.textPrimary }]}>
                        {n <= (ratings[p.user_id]?.rating ?? 0) ? '★' : '☆'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.ratingRow}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Sportsmanship</Text>
                <View style={styles.stars}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <TouchableOpacity
                      key={n}
                      onPress={() => setRating(p.user_id, 'sportsmanship', n)}
                      style={[styles.starBtn, { borderColor: colors.border }]}
                    >
                      <Text style={[styles.starText, { color: colors.textPrimary }]}>
                        {n <= (ratings[p.user_id]?.sportsmanship ?? 0) ? '★' : '☆'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          ))
        )}

        {canSubmit && (
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: colors.primary }]}
            onPress={submit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.submitBtnText}>Submit ratings</Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  title: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, marginBottom: spacing.xs },
  subtitle: { fontSize: fontSize.base, marginBottom: spacing.xl },
  emptyCard: {
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyText: { fontSize: fontSize.base, textAlign: 'center' },
  playerCard: {
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
  },
  playerName: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, marginBottom: spacing.md },
  ratingRow: { marginBottom: spacing.md },
  label: { fontSize: fontSize.sm, marginBottom: spacing.xs },
  stars: { flexDirection: 'row' },
  starBtn: {
    marginRight: 8,
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starText: { fontSize: 18 },
  submitBtn: {
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  submitBtnText: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: '#FFFFFF' },
});

export default GameRatingScreen;
