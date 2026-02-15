import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useLocale } from '../../context/LocaleContext';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, fontSize, fontWeight, shadow } from '../../theme';
import { weatherApi, WeatherResponse } from '../../services/weather';

const HomeScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { country, currency, formatCurrency } = useLocale();
  const { colors } = useTheme();
  const [weather, setWeather] = useState<WeatherResponse | null>(null);

  useEffect(() => {
    weatherApi.get({ city: user?.city || (country === 'AU' ? 'Sydney' : 'New York') }).then(setWeather).catch(() => {});
  }, [country, user?.city]);

  const quickActions = [
    { icon: '🏋️', label: 'Coaching', key: 'coaching', screen: 'Coaches' },
    { icon: '📋', label: 'Bookings', key: 'bookings', screen: 'Bookings' },
    { icon: '🤝', label: 'Matches', key: 'matches', screen: 'MatchesList' },
    { icon: '📅', label: 'Sessions', key: 'sessions', screen: 'MySessions' },
    { icon: '📊', label: 'Stats', key: 'stats', screen: 'Stats' },
    { icon: '🏆', label: 'Events', key: 'events', screen: 'Events' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.borderLight }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.textPrimary }]}>
            Hello, {user?.name?.split(' ')[0] || 'Player'} 👋
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Ready to play?</Text>
        </View>
        <View style={[styles.avatarBadge, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.quickActionsRow}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.key}
                style={styles.quickAction}
                activeOpacity={0.7}
                onPress={() => navigation.navigate(action.screen)}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: colors.surface }, shadow.sm]}>
                  <Text style={styles.quickActionEmoji}>{action.icon}</Text>
                </View>
                <Text style={[styles.quickActionLabel, { color: colors.textSecondary }]}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Weather Widget */}
        {weather && (
          <View style={[styles.section]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Weather</Text>
            <View style={[styles.weatherCard, { backgroundColor: colors.surface }, shadow.sm]}>
              <View style={styles.weatherRow}>
                <Text style={styles.weatherEmoji}>🌤️</Text>
                <View>
                  <Text style={[styles.weatherTemp, { color: colors.textPrimary }]}>{weather.temp}°</Text>
                  <Text style={[styles.weatherCity, { color: colors.textSecondary }]}>{weather.city} · {weather.condition}</Text>
                </View>
              </View>
              <Text style={[styles.weatherRec, { color: colors.textTertiary }]}>{weather.recommendation}</Text>
            </View>
          </View>
        )}

        {/* Info Cards */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Your Info</Text>
          <View style={[styles.infoCard, { backgroundColor: colors.surface }, shadow.sm]}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Country</Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{country === 'AU' ? '🇦🇺 Australia' : '🇺🇸 United States'}</Text>
            </View>
            <View style={[styles.separator, { backgroundColor: colors.separator }]} />
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Currency</Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{currency}</Text>
            </View>
            <View style={[styles.separator, { backgroundColor: colors.separator }]} />
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Sample Price</Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{formatCurrency(99.99)}</Text>
            </View>
          </View>
        </View>

        {/* Recent Activity placeholder */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recent Activity</Text>
          <View style={[styles.emptyCard, { backgroundColor: colors.surface }, shadow.sm]}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>Your recent sports activity will appear here</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: 56,
    paddingBottom: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  greeting: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, letterSpacing: -0.3 },
  subtitle: { fontSize: fontSize.base, marginTop: spacing.xs },
  avatarBadge: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: fontSize.xl, fontWeight: fontWeight.semibold },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.xxxl },
  section: { marginBottom: spacing.xxl },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, marginBottom: spacing.md },
  quickActionsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  quickAction: { alignItems: 'center', flex: 1 },
  quickActionIcon: {
    width: 56, height: 56, borderRadius: borderRadius.md,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm,
  },
  quickActionEmoji: { fontSize: 24 },
  quickActionLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  infoCard: { borderRadius: borderRadius.md, padding: spacing.lg },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md },
  infoLabel: { fontSize: fontSize.base },
  infoValue: { fontSize: fontSize.base, fontWeight: fontWeight.medium },
  separator: { height: 1 },
  emptyCard: { borderRadius: borderRadius.md, padding: spacing.xxxl, alignItems: 'center' },
  emptyIcon: { fontSize: 32, marginBottom: spacing.md },
  emptyText: { fontSize: fontSize.base, textAlign: 'center' },
  weatherCard: { borderRadius: borderRadius.md, padding: spacing.lg },
  weatherRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  weatherEmoji: { fontSize: 40, marginRight: spacing.md },
  weatherTemp: { fontSize: 28, fontWeight: fontWeight.bold },
  weatherCity: { fontSize: fontSize.sm },
  weatherRec: { fontSize: fontSize.sm, fontStyle: 'italic' },
});

export default HomeScreen;
