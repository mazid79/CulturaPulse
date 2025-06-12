// In Button.tsx

import React, { useState } from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  View,
  Platform,
  // Types that were previously missing if user didn't add them from other fixes:
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Text } from './Text';
import { COLORS, BORDER_RADIUS, SPACING, FONT_FAMILY, FONT_SIZE } from '@/utils/theme';
import * as Haptics from 'expo-haptics';

// Theme constants for Button (as defined in previous responses)
const BTN_THEME = {
  bgPrimary: COLORS.primary?.[600] || '#BB86FC',
  bgPrimaryPressed: COLORS.primary?.[700] || '#8A5DC5',
  bgSecondary: COLORS.neutral?.[700] || '#2E2E2E',
  bgSecondaryPressed: COLORS.neutral?.[800] || '#1E1E1E',
  bgOutline: 'transparent',
  bgGhost: 'transparent',
  bgDisabled: COLORS.neutral?.[600] || '#424242',

  textPrimary: COLORS.white || '#FFFFFF',
  textSecondaryColor: COLORS.primary?.[300] || '#E0E0E0',
  textOutlineColor: COLORS.primary?.[400] || '#BB86FC',
  textGhostColor: COLORS.primary?.[400] || '#BB86FC',
  textDisabledColor: COLORS.neutral?.[500] || '#757575',

  borderOutline: COLORS.primary?.[500] || '#BB86FC',
  borderDisabled: COLORS.neutral?.[500] || '#555555',
  shadowColor: COLORS.black || '#000000',
  gradientPrimaryStart: COLORS.secondary?.[400] || '#F06292',
  gradientPrimaryEnd: COLORS.primary?.[500] || '#BB86FC',
};

interface IconProps {
  color?: string;
  size?: number;
}

interface ButtonProps {
  title: string;
  onPress?: () => void; // <--- MADE OPTIONAL HERE
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  leftIcon?: React.ReactElement<IconProps>;
  rightIcon?: React.ReactElement<IconProps>;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  useGradient?: boolean;
  textWeight?: 'light' | 'regular' | 'medium' | 'semibold' | 'bold'; // Make sure this aligns with FontWeightKeys in Text.tsx
}

export function Button({
  title,
  onPress, // Now optional
  variant = 'primary',
  size = 'medium',
  leftIcon,
  rightIcon,
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  useGradient = false,
  textWeight,
}: ButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => !disabled && !loading && setIsPressed(true);
  const handlePressOut = () => !disabled && !loading && setIsPressed(false);

  const handlePress = () => {
    if (disabled || loading) return;
    if ((Platform.OS as string) !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.(); // <--- USE OPTIONAL CHAINING HERE
  };

  // ... (getBackgroundColorForState, buttonContainerStyle, currentTextColorValue, iconSize calculations remain the same) ...
  const getBackgroundColorForState = () => {
    if (disabled) return BTN_THEME.bgDisabled;
    if (isPressed) {
      switch (variant) {
        case 'primary': return BTN_THEME.bgPrimaryPressed;
        case 'secondary': return BTN_THEME.bgSecondaryPressed;
        default: return undefined;
      }
    }
    switch (variant) {
      case 'primary': return useGradient && !disabled ? undefined : BTN_THEME.bgPrimary;
      case 'secondary': return BTN_THEME.bgSecondary;
      case 'outline': return BTN_THEME.bgOutline;
      case 'ghost': return BTN_THEME.bgGhost;
      default: return BTN_THEME.bgPrimary;
    }
  };

  const buttonContainerStyle: StyleProp<ViewStyle> = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    {
      backgroundColor: getBackgroundColorForState(),
      transform: [{ scale: isPressed ? 0.98 : 1 }],
    },
    disabled && styles.disabled,
    style,
  ];

  let currentTextColorValue = BTN_THEME.textPrimary;
  switch (variant) {
    case 'secondary': currentTextColorValue = BTN_THEME.textSecondaryColor; break;
    case 'outline': currentTextColorValue = BTN_THEME.textOutlineColor; break;
    case 'ghost': currentTextColorValue = BTN_THEME.textGhostColor; break;
  }
  if (disabled) currentTextColorValue = BTN_THEME.textDisabledColor;

  let iconSize: number = FONT_SIZE?.md || 16;
  if (size === 'small') iconSize = FONT_SIZE?.sm || 14;
  else if (size === 'large') iconSize = FONT_SIZE?.lg || 18;


  const ButtonContent = () => (
    <>
      {loading ? (
        <ActivityIndicator
          color={currentTextColorValue}
          size="small"
        />
      ) : (
        <View style={styles.contentContainer}>
          {leftIcon && (
            <View style={styles.iconLeft}>
              {React.cloneElement(leftIcon, { color: currentTextColorValue, size: iconSize })}
            </View>
          )}
          <Text
            variant="button"
            weight={textWeight}
            color={currentTextColorValue}
            style={[
                styles[`${size}Text`],
                textStyle
            ]}
          >
            {title}
          </Text>
          {rightIcon && (
            <View style={styles.iconRight}>
              {React.cloneElement(rightIcon, { color: currentTextColorValue, size: iconSize })}
            </View>
          )}
        </View>
      )}
    </>
  );

  return (
    <TouchableOpacity
      style={buttonContainerStyle}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress} // This will call props.onPress?.() internally
      disabled={disabled || loading}
      activeOpacity={1} // Visual feedback handled by isPressed state
    >
      <ButtonContent />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    borderColor: 'transparent',
    shadowColor: BTN_THEME.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  secondary: {
    borderColor: BTN_THEME.borderOutline, // Subtle border for secondary
  },
  outline: {
    borderColor: BTN_THEME.borderOutline,
  },
  ghost: {
    borderColor: 'transparent',
  },
  small: {
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.md - 2,
    borderRadius: BORDER_RADIUS.md,
  },
  medium: {
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.lg -2,
  },
  large: {
    paddingVertical: SPACING.md + 2,
    paddingHorizontal: SPACING.xl -2,
    borderRadius: BORDER_RADIUS.xl,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
    shadowColor: 'transparent',
    elevation: 0,
  },
  smallText: { // Only fontSize, Text component handles the rest
    fontSize: FONT_SIZE?.sm || 14,
  },
  mediumText: {
    fontSize: FONT_SIZE?.md || 16,
  },
  largeText: {
    fontSize: FONT_SIZE?.lg || 18,
  },
  iconLeft: {
    marginRight: SPACING.sm,
  },
  iconRight: {
    marginLeft: SPACING.sm,
  },
});