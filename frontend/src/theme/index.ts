/**
 * Oval App Design System
 * Based on clean, minimal sports UI reference (Gemscore-style)
 *
 * Key principles:
 * - White backgrounds, clean typography
 * - Indigo/purple as primary accent
 * - Subtle separators instead of heavy shadows
 * - Rounded pill chips for filters
 * - Consistent spacing and sizing
 */

export const colors = {
  // Primary
  primary: '#5B5FC7',
  primaryLight: '#EDEDF8',
  primaryDark: '#4547A9',

  // Backgrounds
  background: '#FFFFFF',
  backgroundSecondary: '#F7F7FA',
  surface: '#FFFFFF',

  // Text
  textPrimary: '#1A1A2E',
  textSecondary: '#6E6E82',
  textTertiary: '#9E9EB0',
  textInverse: '#FFFFFF',

  // Accents
  accent: '#F5C518',      // Gold/yellow for stars, highlights
  accentGreen: '#34C759',  // Success states
  accentRed: '#E53935',    // Destructive actions, errors

  // Borders & Separators
  border: '#EBEBF0',
  borderLight: '#F2F2F5',
  separator: '#F0F0F5',

  // Tab bar
  tabInactive: '#B0B0C0',
  tabActive: '#5B5FC7',

  // Status
  success: '#34C759',
  warning: '#FF9500',
  error: '#E53935',
  info: '#5B5FC7',

  // Chips
  chipBackground: '#F0F0F5',
  chipSelectedBackground: '#5B5FC7',
  chipText: '#6E6E82',
  chipSelectedText: '#FFFFFF',

  // Cards
  cardBackground: '#FFFFFF',
  cardBorder: '#F0F0F5',

  // Slots
  slotAvailable: '#E8F5E9',
  slotUnavailable: '#F5F5F5',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};

export const fontSize = {
  xs: 11,
  sm: 12,
  md: 13,
  base: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  title: 26,
  hero: 32,
};

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
};

const theme = {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  shadow,
};

export default theme;
