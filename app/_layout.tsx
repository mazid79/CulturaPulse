import { useEffect } from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '@/hooks/useAuth'; // Assuming useAuth is also exported from this file
import {
  useFonts,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { COLORS } from '@/utils/theme';
import { Text } from '@/components/ui/Text'; // Import your themed Text component for the debug view

// Prevent the splash screen from auto-hiding only on native platforms
if ((Platform.OS as string) !== 'web') {
  SplashScreen.preventAutoHideAsync();
}

// --- Debugging Component ---
function AuthDebugView() {
  const { user, session, loading, authError } = useAuth();

  // Log the state to console for detailed inspection
  useEffect(() => {
    console.log('[AuthDebugView] Auth State Update:', {
      isLoading: loading,
      userExists: !!user,
      userEmail: user?.email,
      sessionExists: !!session,
      authErrorMessage: authError,
    });
  }, [user, session, loading, authError]);

  if (loading) {
    return (
      <View style={styles.debugContainer}>
        <Text variant="subheading" colorKey="primary">Auth Provider is Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.debugContainer}>
      <Text variant="heading" style={{ marginBottom: 10 }}>Auth Debug View</Text>
      <Text>User ID: {user ? user.id : 'null'}</Text>
      <Text>User Email: {user?.email || 'null'}</Text>
      <Text>Display Name: {user?.displayName || 'null'}</Text>
      <Text>Session: {session ? `Exists (Expires: ${session.expires_at ? new Date(session.expires_at * 1000).toLocaleTimeString() : 'N/A'})` : 'null'}</Text>
      {authError && <Text colorKey="error" style={{ marginTop: 10 }}>Error: {authError}</Text>}
      {!user && !loading && <Text style={{marginTop: 10}}>No user is currently signed in.</Text>}
    </View>
  );
}
// --- End Debugging Component ---

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if ((Platform.OS as string) !== 'web') {
      if (fontsLoaded || fontError) {
        SplashScreen.hideAsync();
      }
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (fontError && !fontsLoaded) {
    console.error("Font loading error in _layout:", fontError);
    // You might want to render a dedicated error screen here
    return (
        <View style={styles.rootContainer}>
            <Text colorKey="error">Font loading failed. App cannot start.</Text>
            <StatusBar style="light" />
        </View>
    );
  }

  // --- For Debugging the "Text strings must be rendered within a <Text>" error ---
  // Set `enableDebugView` to true to show AuthDebugView instead of your main app.
  // If the error disappears, the issue is in your Stack screens.
  // If it persists, the problem is more subtle, possibly within useAuth or initial render.
  const enableDebugView = false; // <--- TOGGLE THIS FOR DEBUGGING

  return (
    <AuthProvider>
      <View style={styles.rootContainer}>
        {enableDebugView ? (
          <AuthDebugView />
        ) : (
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="country/[id]" options={{ presentation: 'card' }} />
            <Stack.Screen name="(auth)" options={{ presentation: 'modal' }}/>
            <Stack.Screen name="+not-found" />
          </Stack>
        )}
        <StatusBar style="light" />
      </View>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: COLORS.neutral?.[50] || '#121212',
  },
  debugContainer: { // Styles for the AuthDebugView
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.neutral?.[100] || '#1E1E1E', // Slightly different bg for debug view
  },
});