import { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { COLORS, SPACING, BORDER_RADIUS } from '@/utils/theme';
import { mockCountries } from '@/utils/mockData';
import { Globe, Languages, Calendar, Newspaper } from 'lucide-react-native';

// Group countries by region
const regions = Array.from(new Set(mockCountries.map(country => country.region)));

export default function ExploreScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('regions');

  const handleCountryPress = (countryId: string) => {
    router.push(`/country/${countryId}`);
  };

  const tabs = [
    { id: 'regions', label: 'Regions', icon: <Globe size={20} color={COLORS.primary[500]} /> },
    { id: 'languages', label: 'Languages', icon: <Languages size={20} color={COLORS.primary[500]} /> },
    { id: 'holidays', label: 'Holidays', icon: <Calendar size={20} color={COLORS.primary[500]} /> },
    { id: 'news', label: 'News', icon: <Newspaper size={20} color={COLORS.primary[500]} /> },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text variant="heading" weight="bold" style={styles.title}>
          Explore
        </Text>
        <Text variant="body" style={styles.subtitle}>
          Discover cultures by category
        </Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
        >
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
              onPress={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <Text
                variant="label"
                weight={activeTab === tab.id ? 'medium' : 'regular'}
                style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === 'regions' && (
          <View>
            {regions.map(region => (
              <View key={region} style={styles.regionSection}>
                <Text variant="subheading" weight="medium" style={styles.regionTitle}>
                  {region}
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.regionCountries}
                >
                  {mockCountries
                    .filter(country => country.region === region)
                    .map(country => (
                      <TouchableOpacity
                        key={country.id}
                        style={styles.countryItem}
                        onPress={() => handleCountryPress(country.id)}
                      >
                        <View style={styles.flagContainer}>
                          <Image
                            source={{ uri: country.flagUrl }}
                            style={styles.flag}
                            contentFit="cover"
                          />
                        </View>
                        <Text variant="label" centered style={styles.countryName}>
                          {country.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </ScrollView>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'languages' && (
          <View>
            <Text variant="subheading" weight="medium" style={styles.sectionTitle}>
              Popular Languages
            </Text>
            {['English', 'Spanish', 'French', 'Mandarin', 'Arabic', 'Hindi', 'Portuguese', 'Russian'].map(language => (
              <Card key={language} style={styles.languageCard}>
                <Text variant="subheading" weight="medium">
                  {language}
                </Text>
                <Text variant="caption" style={styles.languageDescription}>
                  {getLanguageSpeakers(language)}
                </Text>
              </Card>
            ))}
          </View>
        )}

        {activeTab === 'holidays' && (
          <View>
            <Text variant="subheading" weight="medium" style={styles.sectionTitle}>
              Upcoming Global Holidays
            </Text>
            {[
              { name: 'Diwali', date: 'November 12, 2023', countries: ['India', 'Nepal', 'Sri Lanka'] },
              { name: 'Thanksgiving', date: 'November 23, 2023', countries: ['United States', 'Canada'] },
              { name: 'Christmas', date: 'December 25, 2023', countries: ['Worldwide'] },
              { name: 'New Year', date: 'January 1, 2024', countries: ['Worldwide'] },
              { name: 'Chinese New Year', date: 'February 10, 2024', countries: ['China', 'Singapore', 'Malaysia'] },
            ].map(holiday => (
              <Card key={holiday.name} style={styles.holidayCard}>
                <Text variant="subheading" weight="medium">
                  {holiday.name}
                </Text>
                <Text variant="body" style={styles.holidayDate}>
                  {holiday.date}
                </Text>
                <Text variant="caption" style={styles.holidayCountries}>
                  {holiday.countries.join(', ')}
                </Text>
              </Card>
            ))}
          </View>
        )}

        {activeTab === 'news' && (
          <View>
            <Text variant="subheading" weight="medium" style={styles.sectionTitle}>
              Cultural News & Events
            </Text>
            {[
              { title: 'Venice Film Festival Awards Announced', region: 'Europe' },
              { title: 'Traditional Tea Ceremony Exhibition Opens in Kyoto', region: 'Asia' },
              { title: 'Rio Carnival Preparations Begin for 2024', region: 'South America' },
              { title: 'Ancient Egyptian Artifacts Discovered in New Excavation', region: 'Africa' },
              { title: 'Indigenous Art Festival Launches Across Australia', region: 'Oceania' },
            ].map(news => (
              <Card key={news.title} style={styles.newsCard}>
                <Text variant="label" weight="medium" style={styles.newsRegion}>
                  {news.region}
                </Text>
                <Text variant="subheading" weight="medium">
                  {news.title}
                </Text>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper function for language tab
function getLanguageSpeakers(language: string): string {
  const data: Record<string, string> = {
    'English': 'Native: 370M, Second language: 900M+',
    'Spanish': 'Native: 460M, Second language: 75M+',
    'French': 'Native: 77M, Second language: 200M+',
    'Mandarin': 'Native: 920M, Second language: 200M+',
    'Arabic': 'Native: 310M, Second language: 270M+',
    'Hindi': 'Native: 340M, Second language: 260M+',
    'Portuguese': 'Native: 220M, Second language: 50M+',
    'Russian': 'Native: 150M, Second language: 110M+',
  };
  
  return data[language] || 'Data not available';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
    backgroundColor: COLORS.white,
  },
  tabs: {
    paddingHorizontal: SPACING.md,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    marginRight: SPACING.md,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary[500],
  },
  tabText: {
    marginLeft: SPACING.xs,
    color: COLORS.neutral[600],
  },
  activeTabText: {
    color: COLORS.primary[600],
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  regionSection: {
    marginBottom: SPACING.xl,
  },
  regionTitle: {
    marginBottom: SPACING.sm,
  },
  regionCountries: {
    paddingRight: SPACING.md,
  },
  countryItem: {
    alignItems: 'center',
    marginRight: SPACING.md,
    width: 80,
  },
  flagContainer: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
    borderWidth: 2,
    borderColor: COLORS.neutral[200],
  },
  flag: {
    width: '100%',
    height: '100%',
  },
  countryName: {
    textAlign: 'center',
    width: '100%',
  },
  sectionTitle: {
    marginBottom: SPACING.md,
  },
  languageCard: {
    marginBottom: SPACING.md,
  },
  languageDescription: {
    marginTop: SPACING.xs,
    color: COLORS.neutral[600],
  },
  holidayCard: {
    marginBottom: SPACING.md,
  },
  holidayDate: {
    marginTop: SPACING.xs,
    color: COLORS.primary[600],
  },
  holidayCountries: {
    marginTop: SPACING.xs,
    color: COLORS.neutral[600],
  },
  newsCard: {
    marginBottom: SPACING.md,
  },
  newsRegion: {
    color: COLORS.secondary[600],
    marginBottom: SPACING.xs,
  },
});