import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, fontSize, fontWeight, shadow } from '../../theme';
import { playpalsApi, PlaypalUser } from '../../services/playpals';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const CARD_WIDTH = SCREEN_WIDTH - spacing.xl * 2;

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

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DiscoveryScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { colors } = useTheme();

  const [profiles, setProfiles] = useState<PlaypalUser[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showMatch, setShowMatch] = useState<PlaypalUser | null>(null);
  const [sportFilter, setSportFilter] = useState<string | null>(null);

  const position = useRef(new Animated.ValueXY()).current;

  const loadProfiles = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = { limit: 20 };
      if (sportFilter) params.sport = sportFilter;
      const response = await playpalsApi.discover(params);
      setProfiles(response.data.matches);
      setCurrentIndex(0);
      position.setValue({ x: 0, y: 0 });
    } catch (error) {
      console.error('Failed to load profiles:', error);
    } finally {
      setLoading(false);
    }
  }, [sportFilter]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy * 0.3 });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          swipeCard('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          swipeCard('left');
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
            friction: 5,
          }).start();
        }
      },
    })
  ).current;

  const swipeCard = (direction: 'left' | 'right') => {
    const x = direction === 'right' ? SCREEN_WIDTH + 100 : -SCREEN_WIDTH - 100;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(async () => {
      const currentProfile = profiles[currentIndex];
      if (currentProfile) {
        try {
          const response = await playpalsApi.swipe(currentProfile.id, direction);
          if (response.data.is_match) {
            setShowMatch(currentProfile);
          }
        } catch (error) {
          console.error('Swipe failed:', error);
        }
      }
      position.setValue({ x: 0, y: 0 });
      setCurrentIndex((prev) => prev + 1);
    });
  };

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ['-8deg', '0deg', '8deg'],
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, SCREEN_WIDTH / 4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const passOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 4, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const currentProfile = profiles[currentIndex];
  const nextProfile = profiles[currentIndex + 1];

  // Match modal
  if (showMatch) {
    return (
      <View style={styles.matchOverlay}>
        <View style={styles.matchContent}>
          <Text style={styles.matchEmoji}>🏆</Text>
          <Text style={[styles.matchTitle, { color: colors.textInverse }]}>{t('playpals.itsAMatch')}</Text>
          <Text style={styles.matchSubtitle}>
            {t('playpals.matchMessage', { name: showMatch.name })}
          </Text>

          <View style={styles.matchAvatarRow}>
            <View style={styles.matchAvatar}>
              <Text style={[styles.matchAvatarText, { color: colors.textInverse }]}>You</Text>
            </View>
            <Text style={styles.matchHeart}>💙</Text>
            <View style={styles.matchAvatar}>
              <Text style={[styles.matchAvatarText, { color: colors.textInverse }]}>
                {showMatch.name?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.matchButton, { backgroundColor: colors.textInverse }]}
            onPress={() => setShowMatch(null)}
            activeOpacity={0.7}
          >
            <Text style={[styles.matchButtonText, { color: colors.primary }]}>{t('playpals.keepSwiping')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.borderLight }]}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t('playpals.discover')}</Text>
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.borderLight }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t('playpals.discover')}</Text>
      </View>

      {/* Sport filter row */}
      <View style={[styles.filterContainer, { backgroundColor: colors.background, borderBottomColor: colors.borderLight }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterChip, { backgroundColor: colors.chipBackground }, !sportFilter && { backgroundColor: colors.primary }]}
            onPress={() => setSportFilter(null)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterChipText, { color: colors.chipText }, !sportFilter && { color: colors.textInverse }]}>
              {t('playpals.allSports')}
            </Text>
          </TouchableOpacity>
          {Object.keys(SPORT_EMOJIS).slice(0, 8).map((sport) => (
            <TouchableOpacity
              key={sport}
              style={[styles.filterChip, { backgroundColor: colors.chipBackground }, sportFilter === sport && { backgroundColor: colors.primary }]}
              onPress={() => setSportFilter(sportFilter === sport ? null : sport)}
              activeOpacity={0.7}
            >
              <Text style={styles.filterEmoji}>{SPORT_EMOJIS[sport]}</Text>
              <Text style={[styles.filterChipText, { color: colors.chipText }, sportFilter === sport && { color: colors.textInverse }]}>
                {sport.charAt(0).toUpperCase() + sport.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Cards area */}
      <View style={styles.cardArea}>
        {!currentProfile ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🧭</Text>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>{t('playpals.noMore')}</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>{t('playpals.checkBack')}</Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.primary }]}
              onPress={loadProfiles}
              activeOpacity={0.7}
            >
              <Text style={[styles.retryButtonText, { color: colors.textInverse }]}>{t('common.retry')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Next card (behind) */}
            {nextProfile && (
              <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }, styles.cardBehind]}>
                <CardContent profile={nextProfile} t={t} />
              </View>
            )}

            {/* Current card (draggable) */}
            <Animated.View
              {...panResponder.panHandlers}
              style={[
                styles.card,
                { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder },
                {
                  transform: [
                    { translateX: position.x },
                    { translateY: position.y },
                    { rotate },
                  ],
                },
              ]}
            >
              {/* Like / Pass overlay labels */}
              <Animated.View style={[styles.stampContainer, styles.stampLike, { borderColor: colors.accentGreen, opacity: likeOpacity }]}>
                <Text style={[styles.stampLikeText, { color: colors.accentGreen }]}>LIKE 👍</Text>
              </Animated.View>
              <Animated.View style={[styles.stampContainer, styles.stampPass, { borderColor: colors.accentRed, opacity: passOpacity }]}>
                <Text style={[styles.stampPassText, { color: colors.accentRed }]}>PASS 👎</Text>
              </Animated.View>

              <CardContent
                profile={currentProfile}
                t={t}
                onViewProfile={() =>
                  navigation.navigate('PlaypalProfile', { userId: currentProfile.id })
                }
              />
            </Animated.View>
          </>
        )}
      </View>

      {/* Action buttons */}
      {currentProfile && (
        <View style={[styles.actionsRow, { backgroundColor: colors.background, borderTopColor: colors.borderLight }]}>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionPass, { backgroundColor: colors.background, borderColor: colors.accentRed }]}
            onPress={() => swipeCard('left')}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionPassText, { color: colors.accentRed }]}>⛔</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => swipeCard('right')}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionLikeText, { color: colors.textInverse }]}>💚</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

/** Inner card content */
const CardContent = ({
  profile,
  t,
  onViewProfile,
}: {
  profile: PlaypalUser;
  t: any;
  onViewProfile?: () => void;
}) => {
  const { colors } = useTheme();
  const skills = profile.UserSportsSkills || [];
  const availability = profile.UserAvailabilities || [];
  const photo = profile.UserProfilePhotos?.[0];
  const initial = profile.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <ScrollView
      style={styles.cardInner}
      contentContainerStyle={styles.cardInnerContent}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
    >
      {/* Avatar / Photo */}
      <View style={styles.cardAvatarArea}>
        {photo ? (
          <View style={[styles.cardAvatarLarge, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.cardAvatarText, { color: colors.primary }]}>{initial}</Text>
          </View>
        ) : (
          <View style={[styles.cardAvatarLarge, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.cardAvatarText, { color: colors.primary }]}>{initial}</Text>
          </View>
        )}
        {profile.match_score != null && profile.match_score > 0 && (
          <View style={[styles.scoreBadge, { backgroundColor: colors.accent }]}>
            <Text style={[styles.scoreBadgeText, { color: colors.textPrimary }]}>{profile.match_score}%</Text>
          </View>
        )}
      </View>

      {/* Name + location */}
      <Text style={[styles.cardName, { color: colors.textPrimary }]}>{profile.name}</Text>
      {profile.city && (
        <Text style={[styles.cardLocation, { color: colors.textSecondary }]}>📌 {profile.city}{profile.country ? `, ${profile.country}` : ''}</Text>
      )}

      {/* Bio */}
      {profile.bio ? (
        <Text style={[styles.cardBio, { color: colors.textSecondary }]}>{profile.bio}</Text>
      ) : null}

      {/* Match reasons */}
      {profile.match_reasons && profile.match_reasons.length > 0 && (
        <View style={styles.reasonsRow}>
          {profile.match_reasons.map((reason, idx) => (
            <View key={idx} style={[styles.reasonChip, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.reasonChipText, { color: colors.primary }]}>{reason}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Sports + skills */}
      {skills.length > 0 && (
        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>{t('playpals.sports')}</Text>
          <View style={styles.skillsRow}>
            {skills.map((skill) => (
              <View key={skill.id} style={[styles.skillChip, { backgroundColor: colors.backgroundSecondary }]}>
                <Text style={styles.skillEmoji}>
                  {SPORT_EMOJIS[skill.sport_name.toLowerCase()] || '🏅'}
                </Text>
                <View>
                  <Text style={[styles.skillName, { color: colors.textPrimary }]}>{skill.sport_name}</Text>
                  <View style={[styles.skillLevelBadge, { backgroundColor: SKILL_COLORS[skill.skill_level] || colors.textTertiary }]}>
                    <Text style={styles.skillLevelText}>
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
        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>{t('playpals.availability')}</Text>
          <View style={styles.availRow}>
            {availability.map((slot) => (
              <View key={slot.id} style={[styles.availChip, { backgroundColor: colors.backgroundSecondary }]}>
                <Text style={[styles.availDay, { color: colors.textPrimary }]}>{DAY_LABELS[slot.day_of_week]}</Text>
                <Text style={[styles.availTime, { color: colors.textSecondary }]}>{slot.start_time}–{slot.end_time}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* View full profile link */}
      {onViewProfile && (
        <TouchableOpacity style={styles.viewProfileButton} onPress={onViewProfile} activeOpacity={0.7}>
          <Text style={[styles.viewProfileText, { color: colors.primary }]}>{t('playpals.viewProfile')} →</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: 56,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.3,
    textTransform: 'capitalize',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Filters
  filterContainer: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  filterScroll: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
    marginRight: spacing.sm,
    gap: 4,
  },
  filterChipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  filterEmoji: {
    fontSize: 14,
  },

  // Card area
  cardArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    maxHeight: '90%',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    ...shadow.lg,
    overflow: 'hidden',
  },
  cardBehind: {
    top: 8,
    transform: [{ scale: 0.96 }],
    opacity: 0.6,
  },
  cardInner: {
    flex: 1,
  },
  cardInnerContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },

  // Avatar
  cardAvatarArea: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  cardAvatarLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardAvatarText: {
    fontSize: 36,
    fontWeight: fontWeight.bold,
  },
  scoreBadge: {
    position: 'absolute',
    bottom: -4,
    right: '32%',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
  },
  scoreBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },

  // Card text
  cardName: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },
  cardLocation: {
    fontSize: fontSize.base,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  cardBio: {
    fontSize: fontSize.base,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 20,
  },

  // Match reasons
  reasonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  reasonChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
  },
  reasonChipText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },

  // Sections
  sectionBlock: {
    marginTop: spacing.xl,
  },
  sectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  skillsRow: {
    gap: spacing.sm,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    gap: spacing.md,
  },
  skillEmoji: {
    fontSize: 24,
  },
  skillName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
  skillLevelBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  skillLevelText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: '#FFFFFF',
  },

  // Availability
  availRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  availChip: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    minWidth: 70,
  },
  availDay: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  availTime: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },

  // View profile
  viewProfileButton: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  viewProfileText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },

  // Stamp overlays
  stampContainer: {
    position: 'absolute',
    top: 20,
    zIndex: 10,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 3,
  },
  stampLike: {
    right: 20,
    transform: [{ rotate: '15deg' }],
  },
  stampLikeText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  stampPass: {
    left: 20,
    transform: [{ rotate: '-15deg' }],
  },
  stampPassText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },

  // Action buttons
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xxxl,
    paddingVertical: spacing.xl,
    paddingBottom: spacing.xxl,
    borderTopWidth: 1,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.md,
  },
  actionPass: {
    borderWidth: 2,
  },
  actionPassText: {
    fontSize: 28,
    fontWeight: fontWeight.bold,
  },
  actionLikeText: {
    fontSize: 28,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: fontSize.base,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  retryButton: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.pill,
  },
  retryButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },

  // Match overlay
  matchOverlay: {
    flex: 1,
    backgroundColor: 'rgba(72, 95, 240, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  matchContent: {
    alignItems: 'center',
  },
  matchEmoji: {
    fontSize: 72,
    marginBottom: spacing.lg,
  },
  matchTitle: {
    fontSize: fontSize.hero,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },
  matchSubtitle: {
    fontSize: fontSize.lg,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  matchAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginTop: spacing.xxxl,
  },
  matchAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  matchAvatarText: {
    fontSize: 24,
    fontWeight: fontWeight.bold,
  },
  matchHeart: {
    fontSize: 32,
  },
  matchButton: {
    marginTop: spacing.xxxl,
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.pill,
  },
  matchButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
});

export default DiscoveryScreen;
