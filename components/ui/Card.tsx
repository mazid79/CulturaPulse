import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient'; // For gradient border, if you choose to use it
import { COLORS, BORDER_RADIUS, SPACING } from '@/utils/theme'; // Your theme utils

// --- Theme Colors (ensure these keys or equivalents exist in your COLORS object or define them) ---
const CARD_THEME = {
  background: COLORS.neutral?.[800] || '#1E1E1E', // Surface Background for dark theme
  shadowColor: COLORS.black || '#000000',
  // For the optional accent border gradient
  // Use an existing color or add 'accentPink' to your COLORS object in theme.ts
  accentBorderStart: COLORS.secondary?.[400] || '#F06292', // Example: Using a shade of secondary
  accentBorderEnd: COLORS.primary?.[500] || '#BB86FC',
};
// --- End Theme Colors ---

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: 'none' | 'small' | 'medium' | 'large' | 'xlarge';
  elevation?: 'none' | 'subtle' | 'medium' | 'raised' | 'lifted';
  fullWidth?: boolean;
  // showAccentBorder?: boolean; // Optional prop for gradient border (keep commented if not using)
}

export function Card({
  children,
  style,
  padding = 'medium',
  elevation = 'medium',
  fullWidth = false,
  // showAccentBorder = false, // Keep commented if not using
}: CardProps) {
  // Construct the elevation style key dynamically to avoid name collision
  const elevationStyleKey = `elevation${elevation.charAt(0).toUpperCase() + elevation.slice(1)}` as keyof typeof styles;

  const cardStyle = [
    styles.cardBase, // Renamed 'card' to 'cardBase' to avoid potential future naming issues if 'card' was used as a prop value
    styles[padding], // This uses padding styles like styles.none, styles.small, etc.
    styles[elevationStyleKey], // This uses distinct elevation styles like styles.elevationMedium
    fullWidth && styles.fullWidth,
    style, // User-provided styles
  ];

  // Example of using the gradient border (uncomment and install expo-linear-gradient if needed)
  // if (showAccentBorder) {
  //   return (
  //     <LinearGradient
  //       colors={[CARD_THEME.accentBorderStart, CARD_THEME.accentBorderEnd]}
  //       start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
  //       style={[
  //         styles.accentBorderContainer,
  //         fullWidth && styles.fullWidth,
  //         styles[elevationStyleKey], // Apply shadow to the gradient border container itself
  //         style // Apply user's main style to the gradient container
  //       ]}
  //     >
  //       <View style={[styles.cardBase, styles[padding], { shadowOpacity: 0, elevation: 0 } ]} > 
  //          {/* Inner card content, remove direct shadow from here if border has it */}
  //         {children}
  //       </View>
  //     </LinearGradient>
  //   );
  // }

  return (
    <View style={cardStyle}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  cardBase: { // Renamed from 'card'
    backgroundColor: CARD_THEME.background,
    borderRadius: BORDER_RADIUS.xl, // More rounded for modern feel
  },
  // Padding Styles (these keys are unique)
  none: { padding: 0 },
  small: { padding: SPACING.sm },
  medium: { padding: SPACING.md },
  large: { padding: SPACING.lg },
  xlarge: { padding: SPACING.xl },

  // Elevation Styles (Dark Theme - keys are now distinct)
  // These keys match the construction: `elevation${CapitalizedElevationPropValue}`
  elevationNone: { // For elevation='none'
    shadowColor: 'transparent',
    elevation: 0,
  },
  elevationSubtle: { // For elevation='subtle'
    shadowColor: CARD_THEME.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, // Adjusted for dark theme
    shadowRadius: 4,
    elevation: 3, // Android elevation
  },
  elevationMedium: { // For elevation='medium'
    shadowColor: CARD_THEME.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, // More noticeable
    shadowRadius: 8,
    elevation: 6,
  },
  elevationRaised: { // For elevation='raised'
    shadowColor: CARD_THEME.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.30,
    shadowRadius: 12,
    elevation: 10,
  },
  elevationLifted: { // For elevation='lifted'
    shadowColor: CARD_THEME.shadowColor,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 16,
  },
  fullWidth: {
    width: '100%',
  },
  // Style for gradient border container (if used)
  // accentBorderContainer: {
  //   borderRadius: BORDER_RADIUS.xl + 2, // To encompass the border
  //   padding: 2, // Thickness of the border
  //   // Shadows would be applied here instead of the inner cardBase if this is used
  // },
});