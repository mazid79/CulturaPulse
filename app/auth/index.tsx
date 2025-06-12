import { useState } from 'react';
import { COLORS, SPACING, BORDER_RADIUS, FONT_FAMILY, FONT_SIZE } from '@/utils/theme';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator // For a more integrated loading state
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card'; // Card is used
import { useAuth } from '@/hooks/useAuth';
// Assuming FONT_FAMILY for consistency
import { Mail, Lock, X, LogIn, UserPlus } from 'lucide-react-native'; // Updated icons

export default function AuthScreen() {
  const router = useRouter();
  const { signIn, signUp, loading: authLoading } = useAuth(); // Use loading state from useAuth
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [operationLoading, setOperationLoading] = useState(false); // Specific loading for button press
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async () => {
    setError(null);
    setOperationLoading(true);

    try {
      if (isSignIn) {
        await signIn(email, password);
        // Navigation is handled by onAuthStateChange in useAuth or _layout if auto-redirecting
        // router.replace('/(tabs)'); // Usually, onAuthStateChange handles this redirection
      } else {
        if (password !== confirmPassword) {
          setError('Passwords do not match.'); // Set error directly
          setOperationLoading(false);
          return;
        }
        await signUp(email, password);
        // After sign up, Supabase typically sends a confirmation email.
        // User might not be immediately "signed in" in terms of session until confirmation.
        // Or if auto-confirm is on, then onAuthStateChange will handle navigation.
        // router.replace('/(tabs)'); // Or to a "check your email" screen
        // For now, let onAuthStateChange handle it.
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      console.error("Auth Error:", errorMessage, err);
      // Make Supabase errors more user-friendly
      if (errorMessage.toLowerCase().includes('invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else if (errorMessage.toLowerCase().includes('user already registered')) {
        setError('This email is already registered. Try signing in.');
      } else if (errorMessage.toLowerCase().includes('password should be at least 6 characters')) {
        setError('Password should be at least 6 characters long.');
      }
      else {
        setError(errorMessage);
      }
    } finally {
      setOperationLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSignIn(!isSignIn);
    setEmail(''); // Clear fields when toggling
    setPassword('');
    setConfirmPassword('');
    setError(null);
  };

  // This screen is often presented modally, so a back button might not be what's wanted.
  // The "X" button might be better to dismiss the modal if router.back() works for modals.
  // If this screen can be pushed onto a stack, router.back() is fine.
  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)'); // Fallback if it can't go back (e.g. deep link to auth)
    }
  };

  const currentLoadingState = authLoading || operationLoading;
  const authButtonDisabled =
    !email ||
    !password ||
    (!isSignIn && !confirmPassword) ||
    currentLoadingState;

  // Dark theme colors from your theme.ts (conceptual mapping)
  const screenBackgroundColor = COLORS.neutral?.[50] || '#121212';
  const cardBackgroundColor = COLORS.neutral?.[100] || '#1E1E1E';
  const titleColor = COLORS.neutral?.[900] || '#FFFFFF';
  const subtitleColor = COLORS.neutral?.[600] || '#A0A0A0';
  const inputIconColor = COLORS.neutral?.[500] || '#757575';
  const errorTextColor = COLORS.error?.[400] || '#CF6679'; // Brighter red for dark theme
  const toggleTextColor = COLORS.primary?.[400] || '#BB86FC';
  const closeButtonColor = COLORS.neutral?.[700] || '#E0E0E0';


  return (
    <KeyboardAvoidingView
      style={[styles.keyboardView, { backgroundColor: screenBackgroundColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0} // Adjust offset as needed
    >
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled" // Good for forms
      >
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose} hitSlop={{top:10, bottom:10, left:10, right:10}}>
            <X size={28} color={closeButtonColor} />
          </TouchableOpacity>
          
          <View style={styles.headerContainer}>
            {isSignIn ?
                <LogIn size={48} color={COLORS.primary[500]} style={styles.headerIcon} /> :
                <UserPlus size={48} color={COLORS.primary[500]} style={styles.headerIcon} />
            }
            <Text variant="heading" weight="bold" style={[styles.title, { color: titleColor }]}>
              {isSignIn ? 'Welcome Back!' : 'Create Account'}
            </Text>
            <Text variant="body" style={[styles.subtitle, { color: subtitleColor }]}>
              {isSignIn
                ? 'Enter your credentials to continue your cultural journey.'
                : 'Join CulturaPulse to explore global cultures and save your favorites.'}
            </Text>
          </View>
          
          <Card style={[styles.authCard, { backgroundColor: cardBackgroundColor }]} elevation="raised">
            <Input
              label="Email Address"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail size={20} color={inputIconColor} />}
              error={error?.toLowerCase().includes('email') || error?.toLowerCase().includes('user not found') ? error : undefined}
              variant="filled" // Use the themed Input variant
            />
            
            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              leftIcon={<Lock size={20} color={inputIconColor} />}
              error={error?.toLowerCase().includes('password') || error?.toLowerCase().includes('credentials') ? error : undefined}
              variant="filled"
            />
            
            {!isSignIn && (
              <Input
                label="Confirm Password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                leftIcon={<Lock size={20} color={inputIconColor} />}
                error={error?.toLowerCase().includes('match') ? error : undefined}
                variant="filled"
              />
            )}
            
            {error && !error.toLowerCase().includes('email') && !error.toLowerCase().includes('password') && !error.toLowerCase().includes('match') && !error.toLowerCase().includes('user not found') && !error.toLowerCase().includes('credentials') &&(
              <Text variant="caption" style={[styles.generalErrorText, { color: errorTextColor }]}>
                {error}
              </Text>
            )}
            
            <Button
              title={isSignIn ? 'Sign In' : 'Create Account'}
              onPress={handleAuth}
              loading={currentLoadingState}
              disabled={authButtonDisabled}
              style={styles.authButton}
              variant="primary" // Use themed Button
              useGradient // Try with gradient
            />
          </Card>
          
          <TouchableOpacity onPress={toggleAuthMode} style={styles.toggleButton}>
            <Text variant="body" style={[styles.toggleText, { color: toggleTextColor }]}>
              {isSignIn ? "Don't have an account? " : "Already have an account? "}
              <Text weight="bold" style={{ color: toggleTextColor }}>
                {isSignIn ? "Sign Up" : "Sign In"}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    // backgroundColor is set dynamically
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center', // Center content vertically if screen is tall
  },
  container: {
    flex: 1, // Ensure it tries to take space, but flexGrow on scrollContent handles overall
    paddingHorizontal: SPACING.lg, // More horizontal padding
    paddingVertical: SPACING.xl,   // More vertical padding
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? SPACING.xl + SPACING.md : SPACING.lg, // Adjust for status bar
    right: SPACING.lg,
    zIndex: 10,
    padding: SPACING.sm, // Increase touch area
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  headerIcon: {
    marginBottom: SPACING.md,
  },
  title: {
    textAlign: 'center',
    marginBottom: SPACING.sm,
    // color is set dynamically
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
    // color is set dynamically
    lineHeight: (FONT_SIZE.md || 16) * 1.5,
  },
  authCard: {
    padding: SPACING.lg, // More padding inside the card
    marginBottom: SPACING.xl,
    // backgroundColor is set dynamically
    // shadow/elevation from Card component
  },
  authButton: {
    marginTop: SPACING.lg, // More space above button
  },
  generalErrorText: { // Renamed from errorText to distinguish from input-specific errors
    // color is set dynamically
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  toggleButton: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  toggleText: {
    // color is set dynamically
  },
});