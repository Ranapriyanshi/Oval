import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useLocale } from '../../context/LocaleContext';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, fontSize, fontWeight, fontFamily } from '../../theme';
import { ovaloApi, OvaloProfileResponse } from '../../services/ovalo';
import OvaloCharacter from '../../components/Ovalo/OvaloCharacter';
import TierBadge from '../../components/Ovalo/TierBadge';

const ProfileScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const { country, timezone, setCountry } = useLocale();
  const { mode, isDark, colors, setMode, toggleTheme } = useTheme();
  const [ovalo, setOvalo] = useState<OvaloProfileResponse | null>(null);

  useEffect(() => {
    ovaloApi.getProfile().then(setOvalo).catch(() => {});
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.borderLight }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{t('profile.title').toUpperCase()}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar + Name */}
        {user && (
          <View style={styles.profileSection}>
            <View style={[styles.avatarLarge, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.avatarLargeText, { color: colors.primary }]}>
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.nameRow}>
              <Text style={[styles.userName, { color: colors.textPrimary }]}>{user.name}</Text>
              {ovalo && <TierBadge tier={ovalo.tier} size="md" />}
            </View>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user.email}</Text>
            {ovalo && (
              <TouchableOpacity
                style={[styles.ovaloProfileCard, { backgroundColor: colors.primaryLight }]}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('OvaloProfile')}
              >
                <OvaloCharacter tier={ovalo.tier} featherLevel={ovalo.feather_level} size={44} showGlow={false} />
                <View style={styles.ovaloProfileText}>
                  <Text style={[styles.ovaloTierText, { color: colors.primary }]}>{ovalo.tier_label}</Text>
                  <Text style={[styles.ovaloXPText, { color: colors.textSecondary }]}>
                    {ovalo.total_xp.toLocaleString()} XP {ovalo.current_streak > 0 ? `· 🔥 ${ovalo.current_streak}d` : ''}
                  </Text>
                </View>
                <Text style={[styles.ovaloChevron, { color: colors.textTertiary }]}>›</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Appearance Card */}
        <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>APPEARANCE</Text>

          {/* Dark mode toggle */}
          <View style={styles.infoRow}>
            <View style={styles.themeLabel}>
              <Text style={{ fontSize: 20 }}>{isDark ? '🌙' : '☀️'}</Text>
              <Text style={[styles.infoLabelText, { color: colors.textPrimary }]}>
                Dark Mode
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.chipBackground, true: colors.primary }}
              thumbColor={isDark ? colors.primaryLight : '#FFFFFF'}
            />
          </View>

          <View style={[styles.separator, { backgroundColor: colors.separator }]} />

          {/* Theme mode selector */}
          <View style={styles.themeModeRow}>
            {(['light', 'dark', 'system'] as const).map((m) => (
              <TouchableOpacity
                key={m}
                style={[
                  styles.themeModeOption,
                  { backgroundColor: colors.chipBackground },
                  mode === m && { backgroundColor: colors.primaryLight, borderWidth: 1.5, borderColor: colors.primary },
                ]}
                onPress={() => setMode(m)}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 16 }}>
                  {m === 'light' ? '☀️' : m === 'dark' ? '🌙' : '📱'}
                </Text>
                <Text
                  style={[
                    styles.themeModeLabel,
                    { color: colors.textSecondary },
                    mode === m && { color: colors.primary, fontWeight: fontWeight.semibold },
                  ]}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Info Card */}
        <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>ACCOUNT DETAILS</Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Country</Text>
            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
              {country === 'AU' ? '🇦🇺 Australia' : '🇺🇸 United States'}
            </Text>
          </View>
          <View style={[styles.separator, { backgroundColor: colors.separator }]} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{t('profile.timezone')}</Text>
            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{timezone}</Text>
          </View>
        </View>

        {/* Stats & Leaderboards */}
        <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>STATS & LEADERBOARDS</Text>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => navigation.navigate('Stats')}
            activeOpacity={0.7}
          >
            <Text style={[styles.linkIcon]}>📊</Text>
            <Text style={[styles.linkText, { color: colors.textPrimary }]}>My stats</Text>
            <Text style={[styles.linkChevron, { color: colors.textTertiary }]}>›</Text>
          </TouchableOpacity>
          <View style={[styles.separator, { backgroundColor: colors.separator }]} />
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => navigation.navigate('Leaderboards')}
            activeOpacity={0.7}
          >
            <Text style={[styles.linkIcon]}>🏆</Text>
            <Text style={[styles.linkText, { color: colors.textPrimary }]}>Leaderboards</Text>
            <Text style={[styles.linkChevron, { color: colors.textTertiary }]}>›</Text>
          </TouchableOpacity>
          <View style={[styles.separator, { backgroundColor: colors.separator }]} />
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => navigation.navigate('Achievements')}
            activeOpacity={0.7}
          >
            <Text style={[styles.linkIcon]}>🏅</Text>
            <Text style={[styles.linkText, { color: colors.textPrimary }]}>Achievements</Text>
            <Text style={[styles.linkChevron, { color: colors.textTertiary }]}>›</Text>
          </TouchableOpacity>
          <View style={[styles.separator, { backgroundColor: colors.separator }]} />
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => navigation.navigate('Admin')}
            activeOpacity={0.7}
          >
            <Text style={[styles.linkIcon]}>⚙️</Text>
            <Text style={[styles.linkText, { color: colors.textPrimary }]}>Admin</Text>
            <Text style={[styles.linkChevron, { color: colors.textTertiary }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Country Switch */}
        <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>REGION</Text>
          <View style={styles.countryRow}>
            <TouchableOpacity
              style={[
                styles.countryOption,
                { backgroundColor: colors.chipBackground },
                country === 'AU' && { backgroundColor: colors.primaryLight, borderWidth: 1.5, borderColor: colors.primary },
              ]}
              onPress={() => setCountry('AU')}
              activeOpacity={0.7}
            >
              <Text style={styles.countryFlag}>🇦🇺</Text>
              <Text style={[styles.countryLabel, { color: colors.textSecondary }, country === 'AU' && { color: colors.primary, fontWeight: fontWeight.semibold }]}>
                Australia
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.countryOption,
                { backgroundColor: colors.chipBackground },
                country === 'US' && { backgroundColor: colors.primaryLight, borderWidth: 1.5, borderColor: colors.primary },
              ]}
              onPress={() => setCountry('US')}
              activeOpacity={0.7}
            >
              <Text style={styles.countryFlag}>🇺🇸</Text>
              <Text style={[styles.countryLabel, { color: colors.textSecondary }, country === 'US' && { color: colors.primary, fontWeight: fontWeight.semibold }]}>
                United States
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={[styles.logoutButton, { borderColor: colors.accentRed }]}
          onPress={logout}
          activeOpacity={0.7}
        >
          <Text style={[styles.logoutButtonText, { color: colors.accentRed }]}>{t('auth.logout')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: 56,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
  },
  title: {
    fontFamily: fontFamily.roundedBold,
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
  },
  profileSection: { alignItems: 'center', marginBottom: spacing.xxl },
  avatarLarge: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md,
  },
  avatarLargeText: { fontSize: 32, fontWeight: fontWeight.bold },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  userName: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold },
  userEmail: { fontSize: fontSize.base, marginTop: spacing.xs },
  ovaloProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  ovaloProfileText: { flex: 1, marginLeft: spacing.sm },
  ovaloTierText: { fontFamily: fontFamily.roundedBold, fontSize: fontSize.base, fontWeight: fontWeight.bold },
  ovaloXPText: { fontFamily: fontFamily.roundedRegular, fontSize: fontSize.sm, marginTop: 2 },
  ovaloChevron: { fontSize: fontSize.xxl },
  card: {
    borderRadius: borderRadius.md, padding: spacing.lg,
    marginBottom: spacing.lg, borderWidth: 1,
  },
  sectionTitle: {
    fontFamily: fontFamily.roundedBold,
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.lg,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: spacing.md,
  },
  themeLabel: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  infoLabelText: { fontSize: fontSize.base, fontWeight: fontWeight.medium },
  infoLabel: { fontSize: fontSize.base },
  infoValue: { fontSize: fontSize.base, fontWeight: fontWeight.medium },
  separator: { height: 1 },
  themeModeRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  themeModeOption: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: spacing.md, borderRadius: borderRadius.sm, gap: spacing.xs,
  },
  themeModeLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  countryRow: { flexDirection: 'row', gap: spacing.md },
  countryOption: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: spacing.md + 2, borderRadius: borderRadius.sm, gap: spacing.sm,
  },
  countryFlag: { fontSize: 20 },
  countryLabel: { fontSize: fontSize.base, fontWeight: fontWeight.medium },
  logoutButton: {
    borderWidth: 1.5, borderRadius: borderRadius.sm,
    paddingVertical: spacing.lg, alignItems: 'center', marginTop: spacing.sm,
  },
  logoutButtonText: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  linkIcon: { fontSize: 20, marginRight: spacing.md },
  linkText: { flex: 1, fontSize: fontSize.base, fontWeight: fontWeight.medium },
  linkChevron: { fontSize: fontSize.xl },
});

export default ProfileScreen;
