import React, { useState } from 'react';
import { View, TextInput, StyleSheet, StyleProp, ViewStyle, TextStyle, TouchableOpacity, Platform } from 'react-native';
import { Text } from './Text';
import { COLORS, BORDER_RADIUS, SPACING, FONT_SIZE, FONT_FAMILY } from '@/utils/theme';
import { Eye, EyeOff } from 'lucide-react-native';
import * as Haptics from 'expo-haptics'; // Error 1 Fix: Added Haptics import

// --- Theme Colors (ensure these keys or equivalents exist in your COLORS object) ---
const INPUT_THEME = {
  background: COLORS.neutral?.[800] || '#1E1E1E',
  backgroundDisabled: COLORS.neutral?.[700] || '#2A2A2A',
  text: COLORS.neutral?.[100] || '#E0E0E0',
  placeholder: COLORS.neutral?.[500] || '#A0A0A0',
  label: COLORS.neutral?.[300] || '#BDBDBD',
  border: COLORS.neutral?.[600] || '#424242',
  borderFocused: COLORS.primary?.[500] || '#BB86FC',
  borderError: COLORS.error?.[400] || '#CF6679',
  icon: COLORS.neutral?.[400] || '#BDBDBD',
  shadowColor: COLORS.black || '#000000',
};
// --- End Theme Colors ---

// Error 2 Fix: Define a minimal interface for icon props
interface IconProps {
  color?: string;
  size?: number;
  // style?: StyleProp<ViewStyle>; // If icons also take a style prop
}

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'url';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  numberOfLines?: number;
  leftIcon?: React.ReactElement<IconProps>;  // Error 2 Fix: Updated type
  rightIcon?: React.ReactElement<IconProps>; // Error 2 Fix: Updated type for consistency if cloned
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  variant?: 'filled' | 'outline';
}

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  multiline = false,
  numberOfLines = 1,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  disabled = false,
  variant = 'filled',
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
    if ((Platform.OS as string) !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const shouldShowPasswordToggle = secureTextEntry;
  const PasswordToggleIcon = isPasswordVisible ? EyeOff : Eye;
  const iconSize = 20; // Define a consistent icon size

  const leftIconElement = leftIcon ? (
    <View style={styles.iconContainer}>
      {React.cloneElement(leftIcon, { color: INPUT_THEME.icon, size: iconSize })}
    </View>
  ) : null;

  let finalRightIconContent: React.ReactNode = null;
  if (shouldShowPasswordToggle) {
    finalRightIconContent = (
      <TouchableOpacity onPress={togglePasswordVisibility} style={styles.iconTouchable}>
        <PasswordToggleIcon size={iconSize} color={INPUT_THEME.icon} />
      </TouchableOpacity>
    );
  } else if (rightIcon) {
    // If user provides a rightIcon, clone it with theme styling
    finalRightIconContent = (
      <View style={styles.iconContainer}>
        {React.cloneElement(rightIcon, {
          color: rightIcon.props.color || INPUT_THEME.icon,
          size: rightIcon.props.size || iconSize,
        })}
      </View>
    );
  }


  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text variant="label" style={styles.label}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputWrapper,
          styles[variant],
          isFocused && styles.focused,
          error && styles.error,
          disabled && styles.disabled,
        ]}
      >
        {leftIconElement}
        <TextInput
          style={[
            styles.input,
            multiline ? styles.multiline : null, // Error 3 Fix: Use null for falsy conditional style
            leftIconElement ? styles.inputWithLeftIcon : null,
            finalRightIconContent ? styles.inputWithRightIcon : null,
            inputStyle,
            disabled ? styles.inputTextDisabled : null,
          ].filter(Boolean) as StyleProp<TextStyle>} // filter(Boolean) removes falsy values, ensuring a clean style array
          placeholder={placeholder}
          placeholderTextColor={INPUT_THEME.placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={shouldShowPasswordToggle && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          selectionColor={INPUT_THEME.borderFocused}
          underlineColorAndroid="transparent"
        />
        {finalRightIconContent && (
             // If finalRightIconContent is the TouchableOpacity for password toggle, it's already styled.
             // If it's a cloned user icon, it's already wrapped in iconContainer logic above.
             // So, this wrapping View might be redundant if finalRightIconContent is always structured.
             // For simplicity and consistency with leftIconElement structure:
            <View style={styles.iconContainerForRight}>{finalRightIconContent}</View>
        )}
      </View>
      {error && (
        <Text variant="caption" style={styles.errorText}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  label: {
    marginBottom: SPACING.sm,
    color: INPUT_THEME.label,
    fontFamily: FONT_FAMILY?.medium || 'System',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
    shadowColor: INPUT_THEME.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filled: {
    backgroundColor: INPUT_THEME.background,
    borderColor: INPUT_THEME.border,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: INPUT_THEME.border,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.md - 2,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: INPUT_THEME.text,
    fontFamily: FONT_FAMILY?.regular || 'System',
  },
  multiline: {
    textAlignVertical: 'top',
    paddingTop: SPACING.sm, // Ensure this is SPACING.sm, not SPACING.md - 2
    minHeight: SPACING.lg * 2.5,
  },
  inputWithLeftIcon: {
    // Padding is handled by iconContainer now, so input itself doesn't need extra paddingLeft
    // paddingLeft: 0,
  },
  inputWithRightIcon: {
    // Padding is handled by iconContainer now
    // paddingRight: 0,
  },
  iconContainer: { // For left icon and potentially user-provided right icon if cloned
    paddingLeft: SPACING.sm, // Padding for the container of the left icon
    // paddingRight: SPACING.sm, // Padding for the container of the right icon (if it's not the password toggle)
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerForRight: { // Specifically for the right icon area
    paddingRight: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconTouchable: { // For password toggle button specifically
    padding: SPACING.xs, // Makes the touch target a bit bigger
  },
  focused: {
    borderColor: INPUT_THEME.borderFocused,
    borderWidth: 2,
    shadowColor: INPUT_THEME.borderFocused,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  error: {
    borderColor: INPUT_THEME.borderError,
    shadowColor: INPUT_THEME.borderError,
    shadowOpacity: 0.2,
  },
  errorText: {
    color: INPUT_THEME.borderError,
    marginTop: SPACING.xs,
    fontFamily: FONT_FAMILY?.regular || 'System',
  },
  disabled: {
    backgroundColor: INPUT_THEME.backgroundDisabled,
    borderColor: INPUT_THEME.border,
    shadowColor: 'transparent',
    elevation: 0,
    opacity: 0.6,
  },
  inputTextDisabled: {
      color: INPUT_THEME.placeholder,
  }
});