/**
 * Oval App Design System
 * Based on modern UI reference with blue/orange accents
 *
 * Color palette:
 * - Primary Dark/Text: #010100
 * - Accent Blue: #485ff0 (primary interactive)
 * - Accent Orange: #fe9820 (secondary accent)
 * - Primary Light: #ffffff
 *
 * Key principles:
 * - White/dark backgrounds, clean typography
 * - Rounded corners (10–15px) on cards, buttons, inputs
 * - Pill-shaped tags and chips
 */

export type ThemeColors = typeof lightColors;

export const lightColors = {
  // Primary accent (blue)
  primary: '#485ff0',
  primaryLight: '#E8EBFC',
  primaryDark: '#3A4FDB',

  // Backgrounds
  background: '#FFFFFF',
  backgroundSecondary: '#F7F7FA',
  surface: '#FFFFFF',

  // Text
  textPrimary: '#010100',
  textSecondary: '#666666',
  textTertiary: '#9E9EB0',
  textInverse: '#FFFFFF',

  // Accents
  accent: '#fe9820',       // Orange - stars, highlights, secondary accent
  accentGreen: '#34C759',  // Success states
  accentRed: '#E53935',    // Destructive actions, errors

  // Borders & Separators
  border: '#E0E0E0',
  borderLight: '#EBEBF0',
  separator: '#F0F0F5',

  // Tab bar
  tabInactive: '#9E9EB0',
  tabActive: '#485ff0',

  // Status
  success: '#34C759',
  warning: '#fe9820',
  error: '#E53935',
  info: '#485ff0',

  // Chips
  chipBackground: '#F0F0F5',
  chipSelectedBackground: '#485ff0',
  chipText: '#666666',
  chipSelectedText: '#FFFFFF',

  // Cards
  cardBackground: '#FFFFFF',
  cardBorder: '#EBEBF0',
  /** Alternate card (blue-tinted) for list alternating pattern */
  cardAltBackground: '#E8EBFC',
  cardAltBorder: '#D0D6F8',
  cardAltTextPrimary: '#010100',
  cardAltTextSecondary: '#666666',
  cardAltChipBackground: 'rgba(72,95,240,0.15)',
  cardAltChipText: '#333333',

  // Slots
  slotAvailable: '#E8F5E9',
  slotUnavailable: '#F5F5F5',
};

export const darkColors: ThemeColors = {
  // Primary accent (blue)
  primary: '#5C72F5',
  primaryLight: '#252A50',
  primaryDark: '#485ff0',

  // Backgrounds
  background: '#121212',
  backgroundSecondary: '#1A1A1A',
  surface: '#282828',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textTertiary: '#6E6E82',
  textInverse: '#010100',

  // Accents
  accent: '#fe9820',
  accentGreen: '#34C759',
  accentRed: '#FF6B6B',

  // Borders & Separators
  border: '#2A2A2A',
  borderLight: '#252525',
  separator: '#333333',

  // Tab bar
  tabInactive: '#6E6E82',
  tabActive: '#5C72F5',

  // Status
  success: '#34C759',
  warning: '#fe9820',
  error: '#FF6B6B',
  info: '#5C72F5',

  // Chips
  chipBackground: '#333333',
  chipSelectedBackground: '#485ff0',
  chipText: '#B0B0B0',
  chipSelectedText: '#FFFFFF',

  // Cards
  cardBackground: '#282828',
  cardBorder: '#333333',
  /** Alternate card (solid blue) for list alternating pattern */
  cardAltBackground: '#485ff0',
  cardAltBorder: '#5C72F5',
  cardAltTextPrimary: '#FFFFFF',
  cardAltTextSecondary: 'rgba(255,255,255,0.85)',
  cardAltChipBackground: 'rgba(255,255,255,0.2)',
  cardAltChipText: '#FFFFFF',

  // Slots
  slotAvailable: '#1A3020',
  slotUnavailable: '#333333',
};

// Default export for backward compatibility (light mode)
export const colors = lightColors;

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
