import { Link, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/Text'; // Import your themed Text component
import { Button } from '@/components/ui/Button'; // Import your themed Button component
import { COLORS, SPACING, FONT_SIZE } from '@/utils/theme'; // Your theme constants
import { AlertTriangle } from 'lucide-react-native'; // Example icon

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Page Not Found', // Updated title
          headerStyle: { backgroundColor: COLORS.neutral?.[100] || '#1E1E1E' }, // Dark header
          headerTintColor: COLORS.neutral?.[800] || '#E0E0E0', // Light title color
          headerShown: true, // Show header for this screen for navigation
        }}
      />
      <View style={styles.container}>
        <AlertTriangle size={64} color={COLORS.primary?.[500] || '#BB86FC'} style={styles.icon} />
        <Text variant="heading" weight="semibold" style={styles.titleText}>
          Oops!
        </Text>
        <Text variant="subheading" colorKey="secondary" style={styles.messageText}>
          The page you're looking for doesn't seem to exist.
        </Text>
        <Link href="/" asChild replace>
          {/* Use your themed Button component for the link */}
          <Button
            title="Go to Home Screen"
            variant="primary" // Or 'outline' with themed colors
            style={styles.linkButton}
            // leftIcon={<Home size={18} color={COLORS.white} />} // Example icon
          />
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg, // Use theme spacing
    backgroundColor: COLORS.neutral?.[50] || '#121212', // Dark background
  },
  icon: {
    marginBottom: SPACING.lg,
  },
  titleText: {
    // Text color will be handled by <Text> component's dark theme default (light)
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  messageText: {
    // Text color from colorKey="secondary" (will be lighter gray)
    marginBottom: SPACING.xl, // More space before button
    textAlign: 'center',
  },
  linkButton: {
    marginTop: SPACING.md,
    minWidth: 200, // Make button a bit wider
  },
});