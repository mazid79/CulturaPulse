import { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { CountryCard } from '@/components/country/CountryCard';
import { getCountries } from '@/services/api';
import { Country } from '@/types';
import { COLORS, SPACING } from '@/utils/theme';
import { Search, Sparkles } from 'lucide-react-native';

export default function DiscoverScreen() {
  const router = useRouter();
  const [countries, setCountries] = useState<Country[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCountries(countries);
    } else {
      const filtered = countries.filter(country =>
        country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.region.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCountries(filtered);
    }
  }, [searchQuery, countries]);

  const fetchCountries = async () => {
    try {
      setLoading(true);
      const data = await getCountries();
      setCountries(data);
      setFilteredCountries(data);
    } catch (error) {
      console.error('Error fetching countries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCountries();
    setRefreshing(false);
  };

  const handleFeaturedCountryPress = (countryId: string) => {
    router.push(`/country/${countryId}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary[500]} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text variant="heading" weight="bold" style={styles.title}>
          CulturaPulse
        </Text>
        <Text variant="body" style={styles.subtitle}>
          Discover global cultures and local traditions
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Input
          placeholder="Search countries..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Search size={20} color={COLORS.neutral[400]} />}
          containerStyle={styles.searchInput}
        />
      </View>

      {!searchQuery && (
        <View style={styles.featuredSection}>
          <View style={styles.sectionHeader}>
            <Sparkles size={20} color={COLORS.accent[500]} />
            <Text variant="subheading" weight="medium" style={styles.sectionTitle}>
              Featured Destination
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.featuredCard}
            activeOpacity={0.9}
            onPress={() => handleFeaturedCountryPress('jp')}
          >
            <View style={styles.featuredContent}>
              <Text variant="heading" weight="bold" style={styles.featuredTitle}>
                Japan
              </Text>
              <Text variant="body" style={styles.featuredDescription}>
                Explore the blend of ancient traditions and cutting-edge innovation
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={filteredCountries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CountryCard country={item} style={styles.countryCard} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary[500]]}
            tintColor={COLORS.primary[500]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="body" centered>
              No countries found matching your search.
            </Text>
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
    paddingBottom: SPACING.sm,
  },
  title: {
    color: COLORS.primary[700],
  },
  subtitle: {
    color: COLORS.neutral[600],
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  searchInput: {
    marginBottom: 0,
  },
  featuredSection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    marginLeft: SPACING.xs,
  },
  featuredCard: {
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.primary[600],
    padding: SPACING.md,
    justifyContent: 'flex-end',
  },
  featuredContent: {
    width: '70%',
  },
  featuredTitle: {
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  featuredDescription: {
    color: COLORS.white,
    opacity: 0.9,
  },
  listContent: {
    padding: SPACING.md,
    paddingTop: 0,
  },
  countryCard: {
    marginBottom: SPACING.md,
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
});