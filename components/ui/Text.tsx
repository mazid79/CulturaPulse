import { Text as RNText, TextProps as RNTextPropsOriginal, StyleSheet, TextStyle } from 'react-native';
import {
  COLORS,
  FONT_SIZE,
  FONT_WEIGHT_NAME as THEME_FONT_WEIGHT, // Using the specific name from theme.ts
  FONT_FAMILY,
  FontWeightKeys // Import FontWeightKeys from theme.ts
} from '@/utils/theme';

const TEXT_COMPONENT_COLORS = {
  primary: COLORS.neutral?.[800] || '#E0E0E0',
  secondary: COLORS.neutral?.[600] || '#A0A0A0',
  heading: COLORS.neutral?.[900] || '#FFFFFF',
  accent: COLORS.primary?.[500] || '#BB86FC',
  error: COLORS.error?.[500] || '#CF6679',
  white: COLORS.white,
};

interface TextProps extends Omit<RNTextPropsOriginal, 'style'> {
  style?: RNTextPropsOriginal['style'];
  variant?: 'heading' | 'subheading' | 'body' | 'label' | 'caption' | 'button';
  weight?: FontWeightKeys; // Use FontWeightKeys from theme.ts
  color?: string;
  colorKey?: keyof typeof TEXT_COMPONENT_COLORS;
  centered?: boolean;
  uppercase?: boolean;
  letterSpacing?: number;
}

export function Text({
  variant = 'body',
  weight,
  color,
  colorKey,
  centered = false,
  uppercase = false,
  letterSpacing,
  style: userProvidedStyle,
  children,
  ...props
}: TextProps) {

  const defaultWeight = getDefaultWeight(variant);
  const currentWeight: FontWeightKeys = weight || defaultWeight;

  let currentColor = color;
  if (!currentColor) {
    if (colorKey && TEXT_COMPONENT_COLORS[colorKey]) {
      currentColor = TEXT_COMPONENT_COLORS[colorKey];
    } else {
      switch (variant) {
        case 'heading': case 'subheading': currentColor = TEXT_COMPONENT_COLORS.heading; break;
        case 'caption': case 'label': currentColor = TEXT_COMPONENT_COLORS.secondary; break;
        default: currentColor = TEXT_COMPONENT_COLORS.primary;
      }
    }
  }

  const fontFamily = FONT_FAMILY[currentWeight] || FONT_FAMILY.regular || 'System';
  // Values from THEME_FONT_WEIGHT are already '300', '400', etc. which are valid fontWeight strings.
  const fontWeightValue = THEME_FONT_WEIGHT[currentWeight] || THEME_FONT_WEIGHT.regular || '400';

  // textStyleFromProps will be a well-defined TextStyle object
  const textStyleFromProps: TextStyle = {
    color: currentColor,
    textAlign: centered ? 'center' : 'left',
    fontFamily: fontFamily,
    fontWeight: fontWeightValue, // Assign directly, types should match if theme.ts is correct
    ...(uppercase && { textTransform: 'uppercase' }),
    ...(letterSpacing !== undefined && { letterSpacing }),
  };

  const variantStyle = getVariantStyles(variant);

  // Construct the final style array
  const finalStyle: RNTextPropsOriginal['style'] = [
    textStyleFromProps,
    variantStyle,
    userProvidedStyle, // userProvidedStyle is already StyleProp<TextStyle>
  ];

  return (
    <RNText style={finalStyle} {...props}>
      {children}
    </RNText>
  );
}

// Helper functions
function getVariantStyles(variant: TextProps['variant']) {
  const baseFontSize = FONT_SIZE || { xs: 12, sm: 14, md: 16, lg: 20, xl: 24, xxl: 30, xxxl: 38 };
  let styles: { fontSize?: number; lineHeight?: number } = {};
  switch (variant) {
    case 'heading':
      styles = { fontSize: baseFontSize.xxxl, lineHeight: baseFontSize.xxxl * 1.2 };
      break;
    case 'subheading':
      styles = { fontSize: baseFontSize.xxl, lineHeight: baseFontSize.xxl * 1.3 };
      break;
    case 'body':
      styles = { fontSize: baseFontSize.md, lineHeight: baseFontSize.md * 1.6 };
      break;
    case 'label':
      styles = { fontSize: baseFontSize.sm, lineHeight: baseFontSize.sm * 1.5 };
      break;
    case 'caption':
      styles = { fontSize: baseFontSize.xs, lineHeight: baseFontSize.xs * 1.4 };
      break;
    case 'button':
      styles = { fontSize: baseFontSize.md, lineHeight: baseFontSize.md * 1.3 };
      break;
    default:
      styles = { fontSize: baseFontSize.md, lineHeight: baseFontSize.md * 1.6 };
  }
  return styles;
}

function getDefaultWeight(variant: TextProps['variant']): FontWeightKeys {
  switch (variant) {
    case 'heading': return 'bold';
    case 'subheading': return 'semibold';
    case 'button': return 'semibold';
    case 'label': return 'medium';
    default: return 'regular';
  }
}