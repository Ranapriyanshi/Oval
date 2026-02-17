import React, { useState, useEffect } from 'react';
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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, fontSize, fontWeight, shadow } from '../../theme';
import { playpalsApi, PlaypalProfile } from '../../services/playpals';

const SPORT_EMOJIS: Record<string, string> = {
  tennis: '🎾',
  basketball: '🏀',
  soccer: '⚽',
  football: '🏈',
  cricket: '🏏',
  swimming: '🏊',
  running: '🏃',
  cycling: '🚴',
  volleyball: '🏐',
  badminton: '🏸',
  golf: '⛳',
  hockey: '🏒',
  rugby: '🏉',
  surfing: '🏄',
  skating: '⛸️',
  skiing: '⛷️',
  boxing: '🥊',
  yoga: '🧘',
  gym: '🏋️',
  hiking: '🥾',
};

const SKILL_COLORS: Record<string, string> = {
  beginner: '#34C759',
  intermediate: '#FF9500',
  advanced: '#485ff0',
  professional: '#E53935',
};

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

type RouteParams = {
  PlaypalProfile: { userId: string };
};

const PlaypalProfileScreen = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, 'PlaypalProfile'>>();
  const { userId } = route.params;

  const [profile, setProfile] = useState<PlaypalProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await playpalsApi.getProfile(userId);
      setProfile(response.data);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnmatch = () => {
    if (!profile) return;
    Alert.alert(
      t('playpals.unmatch'),
      t('playpals.unmatchConfirm', { name: profile.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('playpals.unmatch'),
          style: 'destructive',
          onPress: async () => {
            try {
              await playpalsApi.unmatch(userId);
              navigation.goBack();
            } catch (error) {
              console.error('Unmatch failed:', error);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
        <View style={[styles.headerBar, { backgroundColor: colors.background, borderBottomColor: colors.borderLight }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
        <View style={[styles.headerBar, { backgroundColor: colors.background, borderBottomColor: colors.borderLight }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>{t('common.error')}</Text>
        </View>
      </View>
    );
  }

  const skills = profile.UserSportsSkills || [];
  const availability = profile.UserAvailabilities || [];
  const initial = profile.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      {/* Header bar */}
      <View style={[styles.headerBar, { backgroundColor: colors.background, borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        {profile.is_matched && (
          <View style={[styles.matchedBadge, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.matchedBadgeText, { color: colors.primary }]}>✓ Matched</Text>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile hero */}
        <View style={styles.heroSection}>
          <View style={[styles.avatarLarge, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.avatarLargeText, { color: colors.primary }]}>{initial}</Text>
          </View>
          <Text style={[styles.name, { color: colors.textPrimary }]}>{profile.name}</Text>
          {profile.city && (
            <Text style={[styles.location, { color: colors.textSecondary }]}>
              📌 {profile.city}{profile.country ? `, ${profile.country}` : ''}
            </Text>
          )}
          {profile.karma_points != null && profile.karma_points > 0 && (
            <View style={[styles.karmaBadge, { backgroundColor: colors.accent }]}>
              <Text style={[styles.karmaText, { color: colors.textPrimary }]}>🏅 {profile.karma_points} karma</Text>
            </View>
          )}
        </View>

        {/* Bio */}
        <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{t('playpals.bio')}</Text>
          <Text style={[styles.bioText, { color: colors.textSecondary }]}>
            {profile.bio || t('playpals.noBio')}
          </Text>
        </View>

        {/* Sports & Skills */}
        {skills.length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{t('playpals.sports')}</Text>
            <View style={styles.skillsList}>
              {skills.map((skill) => (
                <View key={skill.id} style={[styles.skillRow, { backgroundColor: colors.backgroundSecondary }]}>
                  <Text style={styles.skillEmoji}>
                    {SPORT_EMOJIS[skill.sport_name.toLowerCase()] || '🏅'}
                  </Text>
                  <View style={styles.skillInfo}>
                    <Text style={[styles.skillName, { color: colors.textPrimary }]}>{skill.sport_name}</Text>
                    <View style={styles.skillLevelRow}>
                      <View
                        style={[
                          styles.skillLevelDot,
                          { backgroundColor: SKILL_COLORS[skill.skill_level] || colors.textTertiary },
                        ]}
                      />
                      <Text style={[styles.skillLevel, { color: colors.textSecondary }]}>
                        {skill.skill_level.charAt(0).toUpperCase() + skill.skill_level.slice(1)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Availability */}
        {availability.length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{t('playpals.availability')}</Text>
            <View style={styles.availGrid}>
              {availability.map((slot) => (
                <View key={slot.id} style={styles.availItem}>
                  <View style={[styles.availDayBadge, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[styles.availDayText, { color: colors.primary }]}>{DAY_LABELS[slot.day_of_week]}</Text>
                  </View>
                  <Text style={[styles.availTimeText, { color: colors.textSecondary }]}>
                    {slot.start_time} – {slot.end_time}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Unmatch button (only if matched) */}
        {profile.is_matched && (
          <TouchableOpacity
            style={[styles.unmatchButton, { borderColor: colors.accentRed }]}
            onPress={handleUnmatch}
            activeOpacity={0.7}
          >
            <Text style={[styles.unmatchButtonText, { color: colors.accentRed }]}>{t('playpals.unmatch')}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    paddingHorizontal: spacing.xl,
    paddingTop: 52,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    paddingVertical: spacing.xs,
  },
  backText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
  },
  matchedBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
  },
  matchedBadgeText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: fontSize.lg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl * 2,
  },

  // Hero section
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...shadow.md,
  },
  avatarLargeText: {
    fontSize: 40,
    fontWeight: fontWeight.bold,
  },
  name: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
  },
  location: {
    fontSize: fontSize.base,
    marginTop: spacing.xs,
  },
  karmaBadge: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
  },
  karmaText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },

  // Cards
  card: {
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.md,
  },
  bioText: {
    fontSize: fontSize.base,
    lineHeight: 22,
  },

  // Skills
  skillsList: {
    gap: spacing.md,
  },
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    gap: spacing.md,
  },
  skillEmoji: {
    fontSize: 28,
  },
  skillInfo: {
    flex: 1,
  },
  skillName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  skillLevelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 3,
  },
  skillLevelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  skillLevel: {
    fontSize: fontSize.sm,
  },

  // Availability
  availGrid: {
    gap: spacing.sm,
  },
  availItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  availDayBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
    minWidth: 90,
    alignItems: 'center',
  },
  availDayText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  availTimeText: {
    fontSize: fontSize.base,
  },

  // Unmatch
  unmatchButton: {
    borderWidth: 1.5,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  unmatchButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
});

export default PlaypalProfileScreen;
