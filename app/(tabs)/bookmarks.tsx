import { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { CountryCard } from '@/components/country/CountryCard';
import { useAuth } from '@/hooks/useAuth';
import { getCountries } from '@/services/api';
import { Country } from '@/types';
import { COLORS, SPACING } from '@/utils/theme';
import { Bookmark, Plus } from 'lucide-react-native';

export default function BookmarksScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [bookmarkedCountries, setBookmarkedCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookmarkedCountries();
  }, [user]);

  const loadBookmarkedCountries = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        setBookmarkedCountries([]);
        setLoading(false);
        return;
      }
      
      // Fetch all countries
      const allCountries = await getCountries();
      
      // Filter to only include bookmarked countries
      const bookmarks = user.bookmarkedCountries || [];
      const bookmarked = allCountries.filter(country => 
        bookmarks.includes(country.id)
      ).map(country => ({
        ...country,
        isBookmarked: true
      }));
      
      setBookmarkedCountries(bookmarked);
    } catch (error) {
      console.error('Error loading bookmarked countries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = () => {
    router.push('/auth');
  };

  const handleExplore = () => {
    router.push('/explore');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary[500]} />
      </View>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text variant="heading" weight="bold" style={styles.title}>
            Bookmarks
          </Text>
        </View>
        <View style={styles.emptyStateContainer}>
          <Bookmark size={60} color={COLORS.neutral[300]} />
          <Text variant="subheading" weight="medium" style={styles.emptyStateTitle}>
            Sign in to save countries
          </Text>
          <Text variant="body" style={styles.emptyStateMessage}>
            Create an account to bookmark your favorite countries and access them anytime.
          </Text>
          <Button
            title="Sign In"
            onPress={handleSignIn}
            style={styles.signInButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text variant="heading" weight="bold" style={styles.title}>
          Bookmarks
        </Text>
        <Text variant="body" style={styles.subtitle}>
          Your saved countries and cultures
        </Text>
      </View>

      <FlatList
        data={bookmarkedCountries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CountryCard country={item} style={styles.countryCard} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyStateContainer}>
            <Bookmark size={60} color={COLORS.neutral[300]} />
            <Text variant="subheading" weight="medium" style={styles.emptyStateTitle}>
              No bookmarks yet
            </Text>
            <Text variant="body" style={styles.emptyStateMessage}>
              Start exploring and bookmark countries to see them here.
            </Text>
            <Button
              title="Explore Countries"
              onPress={handleExplore}
              leftIcon={<Plus size={20} color={COLORS.white} />}
              style={styles.exploreButton}
            />
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.neutral[50],
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
  },
  title: {
    color: COLORS.primary[700],
  },
  subtitle: {
    color: COLORS.neutral[600],
  },
  listContent: {
    padding: SPACING.md,
  },
  countryCard: {
    marginBottom: SPACING.md,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyStateTitle: {
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptyStateMessage: {
    textAlign: 'center',
    color: COLORS.neutral[600],
    marginBottom: SPACING.lg,
  },
  signInButton: {
    width: 200,
  },
  exploreButton: {
    width: 200,
  },
});