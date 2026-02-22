import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useLocale } from '../../context/LocaleContext';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, fontSize, fontWeight, shadow, fontFamily } from '../../theme';
import { weatherApi, WeatherResponse } from '../../services/weather';
import { ovaloApi, OvaloProfileResponse, TIER_LABELS } from '../../services/ovalo';
import OvaloCharacter from '../../components/Ovalo/OvaloCharacter';
import CoachingIcon from '../../assets/Black Kettlebell Display.png';
import BookingIcon from '../../assets/Sealed Envelope Display.png';
import MatchesIcon from '../../assets/Minimalist Yellow Trophy.png';
import SessionsIcon from '../../assets/Stylized Alarm Clock.png';
import StatsIcon from '../../assets/Floating Yellow Crown.png';
import EventsIcon from '../../assets/xmas-icons/38-White Poinsettia.png';
import LocationImage from '../../assets/Stylized Paper Art Landscape with Location Marker.png';
import BoyAvatar from '../../assets/3D Modeled Young Boy Portrait.png';
import GirlAvatar from '../../assets/3D Model of Young Woman with Curious Expression.png';
import HeartIcon from '../../assets/Modern Flame Icon.png';
import EnvelopeIcon from '../../assets/Smiling Yellow Envelope.png';

const CoinIcon = require('../../assets/gold-coin-icon-isolated-3d-render-illustration.png');

const WEATHER_SHADOW_HEIGHT = 4;

const HomeScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { country, currency, formatCurrency } = useLocale();
  const { colors } = useTheme();
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [ovalo, setOvalo] = useState<OvaloProfileResponse | null>(null);

  useEffect(() => {
    weatherApi.get({ city: user?.city || (country === 'AU' ? 'Sydney' : 'New York') }).then(setWeather).catch(() => {});
    ovaloApi.getProfile().then(setOvalo).catch(() => {});
  }, [country, user?.city]);

  const quickActions: {
    icon: ImageSourcePropType;
    label: string;
    description: string;
    key: string;
    screen: string;
    background: string;
    shadowBackground: string;
  }[] = [
    // Slightly darker, saturated tiles plus an even darker shadow stripe
    {
      icon: MatchesIcon,
      label: 'Matches',
      description: 'View and manage your upcoming matches',
      key: 'matches',
      screen: 'MatchesList',
      background: '#34D399',
      shadowBackground: '#059669',
    },
    {
      icon: EventsIcon,
      label: 'Events',
      description: 'Discover tournaments, socials and more',
      key: 'events',
      screen: 'Events',
      background: '#A78BFA',
      shadowBackground: '#6D28D9',
    },
    
    {
      icon: CoachingIcon,
      label: 'Coaching',
      description: 'Find coaches and training sessions',
      key: 'coaching',
      screen: 'Coaches',
      background: '#FACC15',
      shadowBackground: '#CA8A04',
    },
    {
      icon: BookingIcon,
      label: 'Bookings',
      description: 'See and edit your court bookings',
      key: 'bookings',
      screen: 'Bookings',
      background: '#FB7185',
      shadowBackground: '#B91C1C',
    },
    // {
    //   icon: SessionsIcon,
    //   label: 'Sessions',
    //   description: 'Track upcoming sessions with coaches',
    //   key: 'sessions',
    //   screen: 'MySessions',
    //   background: '#FB7185',
    //   shadowBackground: '#BE185D',
    // },
    // {
    //   icon: StatsIcon,
    //   label: 'Stats',
    //   description: 'Check your progress and ratings',
    //   key: 'stats',
    //   screen: 'Stats',
    //   background: '#60A5FA',
    //   shadowBackground: '#2563EB',
    // },
  ];

  const getWeatherEmoji = (condition?: string) => {
    if (!condition) return '☁️';
    const value = condition.toLowerCase();
    if (value.includes('storm') || value.includes('thunder')) return '⛈️';
    if (value.includes('rain') || value.includes('drizzle')) return '🌧️';
    if (value.includes('snow')) return '❄️';
    if (value.includes('wind')) return '🌬️';
    if (value.includes('cloud')) return '☁️';
    if (value.includes('sun') || value.includes('clear')) return '☀️';
    return '🌤️';
  };

  const getWeatherRecommendation = (condition?: string) => {
    if (!condition) return 'Good for indoor or outdoor games.';
    const value = condition.toLowerCase();

    if (value.includes('storm') || value.includes('thunder')) {
      return 'Best for indoor games and training today.';
    }
    if (value.includes('rain') || value.includes('drizzle')) {
      return 'Ideal for indoor games, coaching or gym sessions.';
    }
    if (value.includes('snow')) {
      return 'Stick to indoor courts and training.';
    }
    if (value.includes('sun') || value.includes('clear')) {
      return 'Perfect for outdoor matches and events.';
    }
    if (value.includes('cloud')) {
      return 'Great for indoor games or light outdoor rallies.';
    }
    if (value.includes('wind')) {
      return 'Better for indoor games or sheltered venues.';
    }

    return 'Good for flexible indoor or outdoor play.';
  };

  const firstName = user?.name?.split(' ')[0] || 'Player';
  const avatarChoice = user?.avatarChoice;

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      {/* Page header with greeting + profile */}
      <View style={styles.header}>
        <View style={styles.pageHeaderRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Profile')}
            style={[styles.pageHeaderAvatar, { backgroundColor: colors.primaryLight }]}
          >
            {avatarChoice ? (
              <Image
                source={avatarChoice === 'boy' ? BoyAvatar : GirlAvatar}
                style={styles.pageHeaderAvatarImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={[styles.pageHeaderAvatarText, { color: colors.primary }]}>
                {firstName.charAt(0).toUpperCase()}
              </Text>
            )}
          </TouchableOpacity>
          <View style={styles.pageHeaderText}>
            <Text style={[styles.pageHeaderGreeting, { color: colors.textPrimary }]}>
              Hi, {firstName.toUpperCase()}
            </Text>
          </View>
          <View style={styles.pageHeaderActions}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.pageHeaderIconButton}
              onPress={() => navigation.navigate('Events')}
            >
              <Image source={HeartIcon} style={styles.pageHeaderIconImage} resizeMode="contain" />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.pageHeaderIconButton}
              onPress={() => navigation.navigate('Chat')}
            >
              <Image source={EnvelopeIcon} style={styles.pageHeaderIconImage} resizeMode="contain" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Header with Weather (button-style chip) */}
        {weather ? (
          <View style={styles.weatherChipOuter}>
            <View
              style={[
                styles.weatherChipShadow,
                { backgroundColor: '#1e3f7f', borderRadius: borderRadius.lg },
              ]}
            />
            <View
              style={[
                styles.weatherChip,
                {
                  backgroundColor: colors.accent,
                  marginBottom: WEATHER_SHADOW_HEIGHT,
                  transform: [{ translateY: -WEATHER_SHADOW_HEIGHT }],
                },
              ]}
            >
              <View style={styles.weatherHeader}>
                <View style={styles.weatherInfo}>
                  <Text style={styles.weatherEmoji}>{getWeatherEmoji(weather.condition)}</Text>
                  <View style={styles.weatherHeaderText}>
                    <Text style={styles.weatherChipLabel}>TODAY&apos;S WEATHER</Text>
                    <Text style={styles.weatherChipTitle}>
                      {weather.city.toUpperCase()} · {weather.temp}° · {weather.condition}
                    </Text>
                    <Text style={styles.weatherChipRecommendation}>
                      {getWeatherRecommendation(weather.condition)}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.weatherLocation}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('Events')}
                >
                  <View style={styles.weatherLocationDivider} />
                  <Image
                    source={LocationImage}
                    style={styles.weatherLocationImage}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : null}
      </View>

      {/* Events map-style CTA (static, not scrollable) */}
      <View style={styles.eventsSection}>
        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Events')}>
          <View style={styles.eventsChipOuter}>
            <View
              style={[
                styles.eventsChipShadow,
                { backgroundColor: '#5d221e', borderRadius: borderRadius.lg },
              ]}
            />
            <View
              style={[
                styles.eventsChip,
                {
                  backgroundColor: colors.warning,
                },
              ]}
            >
              <View style={styles.eventsMiniMap}>
                <View style={styles.eventsMapCircle} />
                <View style={[styles.eventsMapPin, styles.eventsMapPinTop]} />
                <View style={[styles.eventsMapPin, styles.eventsMapPinLeft]} />
                <View style={[styles.eventsMapPin, styles.eventsMapPinRight]} />
              </View>
              <View style={styles.eventsTextWrapper}>
                <Text style={styles.eventsChipLabel}>EXPLORE</Text>
                <Text style={styles.eventsChipTitle}>EVENTS NEAR ME</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions - colorful tiles */}
        <View style={styles.section}>
          <View style={styles.quickActionsRow}>
            {quickActions.map((action) => (
              <View key={action.key} style={styles.quickActionOuter}>
                <View
                  style={[
                    styles.quickActionShadow,
                    { backgroundColor: action.shadowBackground, borderRadius: borderRadius.lg },
                  ]}
                />
                <TouchableOpacity
                  style={[styles.quickAction, { backgroundColor: action.background }]}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate(action.screen)}
                >
                  <View style={styles.quickActionTextBlock}>
                    <Text style={styles.quickActionLabel}>{action.label.toUpperCase()}</Text>
                    <Text style={styles.quickActionDescription}>{action.description}</Text>
                  </View>
                  <View style={styles.quickActionIcon}>
                    <Image source={action.icon} style={styles.quickActionImage} resizeMode="contain" />
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Info Cards */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>YOUR INFO</Text>
          <View style={[styles.infoCard, { backgroundColor: colors.surface }, shadow.sm]}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>COUNTRY</Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{country === 'AU' ? '🇦🇺 Australia' : '🇺🇸 United States'}</Text>
            </View>
            <View style={[styles.separator, { backgroundColor: colors.separator }]} />
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>CURRENCY</Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{currency}</Text>
            </View>
            <View style={[styles.separator, { backgroundColor: colors.separator }]} />
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>SAMPLE PRICE</Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{formatCurrency(99.99)}</Text>
            </View>
          </View>
        </View>

        {/* Ovalo Mascot Card */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>YOUR OVALO</Text>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('OvaloProfile')}
          >
            <View style={styles.ovaloCardOuter}>
              <View
                style={[styles.ovaloCardShadow, { backgroundColor: '#5a05a8', borderRadius: borderRadius.lg }]}
              />
              <View style={[styles.ovaloCard, { backgroundColor: colors.primary }]}>
                <View style={styles.ovaloCardRow}>
                  {ovalo ? (
                    <OvaloCharacter tier={ovalo.tier} featherLevel={ovalo.feather_level} size={80} showGlow={false} />
                  ) : (
                    <View style={styles.ovaloPlaceholder} />
                  )}
                  <View style={styles.ovaloCardTextBlock}>
                    <Text style={styles.ovaloCardTier}>
                      {ovalo ? ovalo.tier_label : 'Loading...'}
                    </Text>
                    <View style={styles.ovaloXPRow}>
                      <Image source={CoinIcon} style={styles.ovaloCoinIcon} resizeMode="contain" />
                      <Text style={styles.ovaloXPText}>
                        {ovalo ? `${ovalo.total_xp.toLocaleString()} XP` : '— XP'}
                      </Text>
                    </View>
                    {ovalo && ovalo.next_tier && (
                      <View style={styles.ovaloProgressBar}>
                        <View style={[styles.ovaloProgressFill, { width: `${ovalo.progress_pct}%` }]} />
                      </View>
                    )}
                    {ovalo && ovalo.current_streak > 0 && (
                      <Text style={styles.ovaloStreakText}>🔥 {ovalo.current_streak}-day streak</Text>
                    )}
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* FAQ tiles */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>FAQ's</Text>
          {[
            'How do I book a court or venue?',
            'How do I join an existing game?',
            'How does matching with new playpals work?',
            'Can I host my own event or tournament?',
            'How do I reschedule or cancel a booking?',
            'What do the skill levels and ratings mean?',
            'How do I report an issue or player?',
          ].map((question, index) => {
            const backgroundColor = colors.primary;
            const tiltAngles = ['-1.5deg', '1deg', '-0.8deg', '1.3deg', '-1.2deg'];
            const rotate = tiltAngles[index % tiltAngles.length];
            return (
              <TouchableOpacity
                key={question}
                activeOpacity={0.85}
                style={[styles.faqTile, { backgroundColor, transform: [{ rotate }] }]}
              >
                <Text style={styles.faqText}>{question}</Text>
                <View style={styles.faqChevron}>
                  <Text style={styles.faqChevronText}>›</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  pageHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  pageHeaderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pageHeaderAvatarText: {
    fontFamily: fontFamily.roundedBold,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  pageHeaderText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  pageHeaderGreeting: {
    fontFamily: fontFamily.roundedBold,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  pageHeaderAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  pageHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  pageHeaderIconButton: {
    width: 32,
    height: 32,
  },
  pageHeaderIconImage: {
    width: '100%',
    height: '100%',
  },
  weatherChipOuter: {
    width: '100%',
    position: 'relative',
  },
  weatherChipShadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
  },
  weatherChip: {
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: spacing.lg,
  },
  weatherHeaderText: {
    marginLeft: spacing.md,
  },
  weatherLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherLocationDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginRight: spacing.md,
  },
  weatherLocationImage: {
    width: 40,
    height: 40,
  },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.xxxl },
  section: { marginBottom: spacing.xxl },
  sectionTitle: {
    fontFamily: fontFamily.roundedBold,
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.md,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  quickActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionOuter: {
    width: '48%',
    marginBottom: spacing.lg,
    position: 'relative',
  },
  quickActionShadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: WEATHER_SHADOW_HEIGHT,
    transform: [{ translateY: -WEATHER_SHADOW_HEIGHT }],
    overflow: 'hidden',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.md,
  },
  quickActionImage: {
    width: 52,
    height: 52,
  },
  quickActionLabel: {
    fontFamily: fontFamily.roundedBold,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  quickActionTextBlock: {
    flex: 1,
  },
  quickActionDescription: {
    marginTop: spacing.xs,
    fontFamily: fontFamily.roundedRegular,
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.9)',
  },
  infoCard: { borderRadius: borderRadius.md, padding: spacing.lg },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md },
  infoLabel: {
    fontFamily: fontFamily.roundedSemibold,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.3,
  },
  infoValue: {
    fontFamily: fontFamily.roundedRegular,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
  separator: { height: 1 },
  emptyCard: { borderRadius: borderRadius.md, padding: spacing.xxxl, alignItems: 'center' },
  emptyIcon: { fontSize: 32, marginBottom: spacing.md },
  emptyText: {
    fontFamily: fontFamily.roundedRegular,
    fontSize: fontSize.base,
    textAlign: 'center',
  },
  ovaloCardOuter: {
    position: 'relative',
  },
  ovaloCardShadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
  },
  ovaloCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: WEATHER_SHADOW_HEIGHT,
    transform: [{ translateY: -WEATHER_SHADOW_HEIGHT }],
  },
  ovaloCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ovaloPlaceholder: {
    width: 80,
    height: 80,
  },
  ovaloCardTextBlock: {
    flex: 1,
    marginLeft: spacing.lg,
  },
  ovaloCardTier: {
    fontFamily: fontFamily.roundedBold,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#FFFFFF',
  },
  ovaloXPRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  ovaloCoinIcon: {
    width: 20,
    height: 20,
  },
  ovaloXPText: {
    fontFamily: fontFamily.roundedSemibold,
    fontSize: fontSize.base,
    color: 'rgba(255,255,255,0.9)',
  },
  ovaloProgressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  ovaloProgressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#FACC15',
  },
  ovaloStreakText: {
    fontFamily: fontFamily.roundedSemibold,
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.xs,
  },
  faqTile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  faqText: {
    flex: 1,
    fontFamily: fontFamily.roundedRegular,
    fontSize: fontSize.base,
  },
  faqChevron: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.md,
  },
  faqChevronText: {
    fontSize: fontSize.lg,
    color: 'rgba(0,0,0,0.45)',
  },
  weatherEmoji: { fontSize: 32},
  weatherChipLabel: {
    fontFamily: fontFamily.roundedSemibold,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  weatherChipTitle: {
    fontFamily: fontFamily.roundedBold,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#FFFFFF',
  },
  weatherChipRecommendation: {
    marginTop: spacing.xs / 2,
    fontFamily: fontFamily.roundedRegular,
    fontSize: fontSize.xs,
    color: '#FFFFFF',
  },
  eventsSection: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xs,
    paddingBottom: spacing.lg,
  },
  eventsChipOuter: {
    width: '100%',
    position: 'relative',
  },
  eventsChipShadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
  },
  eventsChip: {
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    marginBottom: WEATHER_SHADOW_HEIGHT,
    transform: [{ translateY: -WEATHER_SHADOW_HEIGHT }],
  },
  eventsMiniMap: {
    width: '100%',
    height: 120,
    borderRadius: borderRadius.lg,
    backgroundColor: '#FCE6DC',
    marginBottom: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  eventsMapCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#FF8A4A',
  },
  eventsMapPin: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF8A4A',
  },
  eventsMapPinTop: {
    top: 12,
    right: 24,
  },
  eventsMapPinLeft: {
    left: 26,
    top: 56,
  },
  eventsMapPinRight: {
    right: 20,
    bottom: 18,
  },
  eventsTextWrapper: {
    marginTop: spacing.sm,
  },
  eventsChipLabel: {
    fontFamily: fontFamily.roundedSemibold,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  eventsChipTitle: {
    fontFamily: fontFamily.roundedBold,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#FFFFFF',
    marginTop: spacing.xs,
  },
});

export default HomeScreen;
