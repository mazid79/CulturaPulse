import { StyleSheet, Platform } from 'react-native';

// Dark Theme Color Palette
// We are redefining your existing COLORS object to fit the dark theme.
// In a real multi-theme app, you'd have separate palettes.
export const COLORS = {
  // Dark Theme Neutrals (Backgrounds & Surfaces)
  neutral: {
    50: '#121212',   // Deepest background (e.g., App Background)
    100: '#1E1E1E',  // Main surface color (e.g., Card Backgrounds)
    200: '#242424',  // Slightly lighter surface, or raised elements
    300: '#333333',  // Borders, subtle dividers
    400: '#555555',  // Disabled elements, placeholder text background
    500: '#757575',  // Secondary text, icons, disabled text
    600: '#A0A0A0',  // Primary text (less emphasis), icons
    700: '#BDBDBD',  // Primary text (medium emphasis)
    800: '#E0E0E0',  // Primary text (strong emphasis)
    900: '#F5F5F5',  // Headings, very prominent text
  },

  // Primary Accent (Purple)
  primary: {
    50: '#F3E5F5',   // Very light purple (e.g., hover states on light elements if any)
    100: '#E1BEE7',
    200: '#CE93D8',
    300: '#BA68C8',  // Lighter purple accent
    400: '#AB47BC',
    500: '#BB86FC',  // Main Purple Accent (original suggestion)
    600: '#8E24AA',  // Darker Purple (pressed states, variants)
    700: '#7B1FA2',
    800: '#6A1B9A',
    900: '#4A148C',  // Deepest purple
  },

  // Secondary Accent (Pink/Magenta) - for highlights, secondary actions
  secondary: {
    50: '#FCE4EC',
    100: '#F8BBD0',
    200: '#F48FB1',
    300: '#F06292',  // Main Pink/Magenta Accent
    400: '#EC407A',
    500: '#E91E63',
    600: '#D81B60',  // Darker Pink
    700: '#C2185B',
    800: '#AD1457',
    900: '#880E4F',
  },
  
  // Accent (was orange, now repurposed or can be an alternative accent if needed)
  // For now, let's make it a brighter teal/cyan as a tertiary accent for glows or specific highlights
  accent: {
    50: '#E0F7FA',
    100: '#B2EBF2',
    200: '#80DEEA',
    300: '#4DD0E1',
    400: '#26C6DA',
    500: '#00BCD4', // Main Teal/Cyan Accent
    600: '#00ACC1',
    700: '#0097A7',
    800: '#00838F',
    900: '#006064',
  },

  // Success, Warning, Error (can keep similar, but ensure contrast on dark bg)
  success: { // Ensure these have good contrast on dark backgrounds
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50', // Main success
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },
  warning: {
    50: '#FFF8E1',
    100: '#FFECB3',
    200: '#FFE082',
    300: '#FFD54F',
    400: '#FFCA28',
    500: '#FFC107', // Main warning
    600: '#FFB300',
    700: '#FFA000',
    800: '#FF8F00',
    900: '#FF6F00',
  },
  error: { // Ensure good contrast
    50: '#FFEBEE',
    100: '#FFCDD2',
    200: '#EF9A9A',
    300: '#E57373',
    400: '#EF5350',
    500: '#F44336', // Main error (classic red)
    // Or use the pinkish one from before if preferred: COLORS.secondary[500] || '#CF6679'
    600: '#E53935',
    700: '#D32F2F',
    800: '#C62828',
    900: '#B71C1C',
  },

  // Pure colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONT_SIZE = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20, // Slightly increased lg for more impact
  xl: 24,
  xxl: 30, // Adjusted for better heading scale
  xxxl: 38, // Adjusted for better heading scale
};

// In @/utils/theme.ts

// ... (COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOW) ...

export type FontWeightKeys = 'light' | 'regular' | 'medium' | 'semibold' | 'bold';

// Using FONT_WEIGHT_NAME for the object holding string values like '300', '400'
export const FONT_WEIGHT_NAME: Record<FontWeightKeys, "300" | "400" | "500" | "600" | "700" | "normal" | "bold"> = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

export const FONT_FAMILY: Record<FontWeightKeys, string> = {
  light: 'Inter_300Light',     // Make sure Inter_300Light is loaded
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',  // Make sure Inter_600SemiBold is loaded
  bold: 'Inter_700Bold',
};
// --- End Updated Fonts ---

export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Shadows for Dark Theme (opacity might need to be higher or radius larger to be visible)
export const SHADOW = {
  sm: Platform.select({
    ios: {
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 2 }, // Slightly more offset for depth
      shadowOpacity: 0.15, // Increased opacity for dark theme
      shadowRadius: 3,
    },
    android: {
      elevation: 3, // Increased elevation
    },
    default: { // Fallback for web or other platforms
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 3,
    }
  }),
  md: Platform.select({
    ios: {
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25, // Increased opacity
      shadowRadius: 6,
    },
    android: {
      elevation: 5, // Increased elevation
    },
     default: {
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
    }
  }),
  lg: Platform.select({
    ios: {
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 6 }, // More offset
      shadowOpacity: 0.30, // Increased opacity
      shadowRadius: 10, // Larger radius
    },
    android: {
      elevation: 8, // Increased elevation
    },
    default: {
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.30,
      shadowRadius: 10,
    }
  }),
};

// --- Common style mixins updated for Dark Theme ---
export const createStyles = (overrides = {}) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.neutral[50], // Deepest background for main container
    },
    safeArea: {
      flex: 1,
      backgroundColor: COLORS.neutral[50], // Consistent with container
    },
    section: {
      marginVertical: SPACING.md,
      paddingHorizontal: SPACING.md,
    },
    card: { // Default card style using new theme
      backgroundColor: COLORS.neutral[100], // Surface color
      borderRadius: BORDER_RADIUS.lg, // More rounded
      padding: SPACING.lg, // More padding
      ...SHADOW.md, // Apply medium shadow
      marginVertical: SPACING.md, // Increased vertical margin
    },
    textHeading: {
      fontSize: FONT_SIZE.xxxl, // Larger heading
      fontWeight: FONT_WEIGHT_NAME.bold,
      color: COLORS.neutral[900], // Very light text for headings
      marginBottom: SPACING.md, // More margin
      fontFamily: FONT_FAMILY.bold,
    },
    textSubheading: {
      fontSize: FONT_SIZE.xxl, // Larger subheading
      fontWeight: FONT_WEIGHT_NAME.semibold,
      color: COLORS.neutral[800], // Light text
      marginBottom: SPACING.sm,
      fontFamily: FONT_FAMILY.semibold,
    },
    textBody: {
      fontSize: FONT_SIZE.md,
      fontWeight: FONT_WEIGHT_NAME.regular,
      color: COLORS.neutral[700], // Primary readable text
      lineHeight: FONT_SIZE.md * 1.6, // Good line height
      fontFamily: FONT_FAMILY.regular,
    },
    textSmall: {
      fontSize: FONT_SIZE.sm,
      fontWeight: FONT_WEIGHT_NAME.regular,
      color: COLORS.neutral[600], // Secondary text color
      fontFamily: FONT_FAMILY.regular,
    },
    ...overrides,
  });