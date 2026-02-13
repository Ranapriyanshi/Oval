import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useLocale } from '../../context/LocaleContext';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadow } from '../../theme';

const ProfileScreen = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { country, timezone, setCountry } = useLocale();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('profile.title')}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar + Name */}
        {user && (
          <View style={styles.profileSection}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarLargeText}>
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
        )}

        {/* Info Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Account Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Country</Text>
            <Text style={styles.infoValue}>
              {country === 'AU' ? '🇦🇺 Australia' : '🇺🇸 United States'}
            </Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('profile.timezone')}</Text>
            <Text style={styles.infoValue}>{timezone}</Text>
          </View>
        </View>

        {/* Country Switch */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Region</Text>
          <View style={styles.countryRow}>
            <TouchableOpacity
              style={[
                styles.countryOption,
                country === 'AU' && styles.countryOptionSelected,
              ]}
              onPress={() => setCountry('AU')}
              activeOpacity={0.7}
            >
              <Text style={styles.countryFlag}>🇦🇺</Text>
              <Text
                style={[
                  styles.countryLabel,
                  country === 'AU' && styles.countryLabelSelected,
                ]}
              >
                Australia
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.countryOption,
                country === 'US' && styles.countryOptionSelected,
              ]}
              onPress={() => setCountry('US')}
              activeOpacity={0.7}
            >
              <Text style={styles.countryFlag}>🇺🇸</Text>
              <Text
                style={[
                  styles.countryLabel,
                  country === 'US' && styles.countryLabelSelected,
                ]}
              >
                United States
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={logout}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutButtonText}>{t('auth.logout')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
    paddingTop: 56,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  title: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarLargeText: {
    fontSize: 32,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  userName: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  userEmail: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  infoLabel: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
  },
  separator: {
    height: 1,
    backgroundColor: colors.separator,
  },
  countryRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  countryOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md + 2,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.chipBackground,
    gap: spacing.sm,
  },
  countryOptionSelected: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  countryFlag: {
    fontSize: 20,
  },
  countryLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  countryLabelSelected: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  logoutButton: {
    borderWidth: 1.5,
    borderColor: colors.accentRed,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  logoutButtonText: {
    color: colors.accentRed,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
});

export default ProfileScreen;
