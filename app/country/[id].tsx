import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Platform,
  FlatList,
  Dimensions,
  // ViewStyle, StyleProp, // Not directly used at top-level in this file if InfoCard styles are self-contained
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { CultureInsight } from '@/components/country/CultureInsight';
import { LanguagePhraseCard } from '@/components/country/LanguagePhraseCard';
import { HolidayCard } from '@/components/country/HolidayCard';
import { NewsCard } from '@/components/country/NewsCard';
import { BookmarkButton } from '@/components/country/BookmarkButton';
import { useCountryData } from '@/hooks/useCountryData'; // Assuming this now returns refreshData
import { COLORS, SPACING, BORDER_RADIUS, FONT_FAMILY, FONT_SIZE, SHADOW } from '@/utils/theme';
// Error 3 Fix: Added User icon
import { ArrowLeft, Globe, Languages, CalendarDays, Newspaper, Building2, HandCoins, Info, RefreshCw, User } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const HERO_IMAGE_HEIGHT = Dimensions.get('window').height * 0.45;
const HEADER_APPEAR_THRESHOLD = HERO_IMAGE_HEIGHT * 0.5;
const HEADER_FULLY_VISIBLE_THRESHOLD = HERO_IMAGE_HEIGHT * 0.7;

// Theme colors for this screen (map from your global COLORS)
const screenTheme = {
  background: COLORS.neutral?.[50] || '#121212',
  surface: COLORS.neutral?.[100] || '#1E1E1E',
  textPrimaryOnDark: COLORS.neutral?.[800] || '#E0E0E0',
  textSecondaryOnDark: COLORS.neutral?.[600] || '#A0A0A0',
  textOnImage: COLORS.white,
  accentPurple: COLORS.primary?.[500] || '#BB86FC',
  accentPink: COLORS.secondary?.[400] || '#F06292',
  iconColor: COLORS.neutral?.[700] || '#BDBDBD',
  stickyHeaderTitleColor: COLORS.neutral?.[900] || '#FFFFFF',
  // Error 1 Fix: Changed 150 to 200 (a valid key)
  infoCardBackground: COLORS.neutral?.[200] || '#242424',
  infoCardLabel: COLORS.neutral?.[500] || '#757575',
  infoCardValue: COLORS.neutral?.[700] || '#BDBDBD',
  tabBarBorder: COLORS.neutral?.[300] || '#333333',
  activeTabColor: COLORS.primary?.[400] || '#BB86FC',
  inactiveTabColor: COLORS.neutral?.[600] || '#A0A0A0',
};

export default function CountryDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = params.id; // Can be undefined if route is not fully matched
  const router = useRouter();
  
  // Error 2 Fix: Assuming useCountryData returns refreshData in its result object
  const { country, culturalTips, phrases, holidays, news, loading, error, refreshData } = useCountryData(id);

  const scrollY = useRef(new Animated.Value(0)).current;
  const [activeTab, setActiveTab] = useState('culture');
  const flagOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!id && !loading) { // If ID is missing and we are not in an initial loading phase from useCountryData
        console.error("CountryDetailScreen: ID parameter is undefined.");
        // Consider redirecting or showing a more specific "invalid route" message
        // This might already be handled by the !country check later if useCountryData returns error for undefined id
    }
  }, [id, loading, router]);

  useEffect(() => {
    if (country) {
      Animated.timing(flagOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }).start();
    }
  }, [country, flagOpacity]);

  const handleTabChange = (tab: string) => {
    if (tab === activeTab) return;
    if ((Platform.OS as string) !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setActiveTab(tab);
  };

  const TABS = [
    { id: 'culture', label: 'Culture', icon: Globe },
    { id: 'language', label: 'Language', icon: Languages },
    { id: 'holidays', label: 'Holidays', icon: CalendarDays },
    { id: 'news', label: 'News', icon: Newspaper },
  ];

  const headerBackgroundOpacity = scrollY.interpolate({
    inputRange: [HEADER_APPEAR_THRESHOLD, HEADER_FULLY_VISIBLE_THRESHOLD],
    outputRange: [0, 1], extrapolate: 'clamp',
  });
  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [HEADER_APPEAR_THRESHOLD + 20, HEADER_FULLY_VISIBLE_THRESHOLD + 40],
    outputRange: [0, 1], extrapolate: 'clamp',
  });
  const heroImageTranslateY = scrollY.interpolate({
    inputRange: [-HERO_IMAGE_HEIGHT, 0, HERO_IMAGE_HEIGHT],
    outputRange: [-HERO_IMAGE_HEIGHT / 2.5, 0, HERO_IMAGE_HEIGHT * 0.5], extrapolate: 'clamp',
  });
  const heroImageScale = scrollY.interpolate({
    inputRange: [-HERO_IMAGE_HEIGHT, 0], outputRange: [2, 1], extrapolate: 'clamp',
  });
  const heroContentOpacity = scrollY.interpolate({
    inputRange: [0, HERO_IMAGE_HEIGHT / 2.5], outputRange: [1, 0], extrapolate: 'clamp',
  });

  if (loading && !country) {
    return (
      <View style={[styles.messageContainer, { backgroundColor: screenTheme.background }]}>
        <ActivityIndicator size="large" color={screenTheme.accentPurple} />
        <Text style={{marginTop: SPACING.md}} colorKey='primary'>Loading Country Details...</Text>
      </View>
    );
  }

  // Handle missing ID more explicitly here before trying to access country details
  if (!id) {
    return (
      <View style={[styles.messageContainer, { backgroundColor: screenTheme.background }]}>
        <Info size={64} color={COLORS.warning?.[500]} style={{ marginBottom: SPACING.lg}}/>
        <Text variant="heading" weight="medium" style={styles.errorTitleText}>
          Invalid Country
        </Text>
        <Text variant="body" style={styles.errorMessageText}>
          No country ID was provided to display details.
        </Text>
        <Button
          title="Go Back"
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} // Go to tabs if no back history
          variant="primary"
          leftIcon={<ArrowLeft size={18} />}
          style={{ marginTop: SPACING.lg }}
        />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.messageContainer, { backgroundColor: screenTheme.background }]}>
        <Info size={64} color={COLORS.error?.[500]} style={{ marginBottom: SPACING.lg}}/>
        <Text variant="heading" weight="medium" style={styles.errorTitleText}>
          Oops! Something went wrong.
        </Text>
        <Text variant="body" style={styles.errorMessageText}>
          {error || "Could not load country data."}
        </Text>
        <Button
          title="Go Back"
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')}
          variant="outline"
          leftIcon={<ArrowLeft size={18} />}
          style={{ marginTop: SPACING.lg, borderColor: screenTheme.accentPurple }}
          textStyle={{ color: screenTheme.accentPurple }}
        />
         {refreshData && ( // Check if refreshData function exists
            <Button
                title="Try Again"
                onPress={() => id && refreshData(id)} // Pass id to refreshData
                variant="primary"
                leftIcon={<RefreshCw size={18} />}
                style={{ marginTop: SPACING.md }}
            />
        )}
      </View>
    );
  }
  
  if (!country) { // This case should ideally be covered by error or missing id already
    return (
      <View style={[styles.messageContainer, { backgroundColor: screenTheme.background }]}>
         <Globe size={64} color={screenTheme.textSecondaryOnDark} style={{ marginBottom: SPACING.lg}}/>
        <Text variant="subheading" weight="medium" style={styles.errorTitleText}>
          Country Data Not Available
        </Text>
        <Text variant="body" style={styles.errorMessageText}>
            We couldn't find the details for this country at the moment.
        </Text>
        <Button
          title="Go Back"
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')}
          variant="primary"
          leftIcon={<ArrowLeft size={18} />}
          style={{ marginTop: SPACING.lg }}
        />
      </View>
    );
  }

  const renderEmptyState = (message: string) => (
    <View style={styles.emptyStateContainer}>
      <Text variant="body" colorKey="secondary" style={styles.emptyStateText}>{message}</Text>
    </View>
  );
  
  const renderTabContent = () => {
    const listProps = {
        contentContainerStyle: styles.listContentContainer,
        showsVerticalScrollIndicator: false,
    };
    switch (activeTab) {
      case 'culture':
        return culturalTips && culturalTips.length > 0 ? (
          <FlatList data={culturalTips} keyExtractor={(item) => item.id} renderItem={({ item }) => <CultureInsight tip={item} />} {...listProps} />
        ) : renderEmptyState(`Cultural insights for ${country.name} are being curated.`);
      case 'language':
        return phrases && phrases.length > 0 ? (
          <FlatList data={phrases} keyExtractor={(item) => item.id} renderItem={({ item }) => <LanguagePhraseCard phrase={item} />} {...listProps} />
        ) : renderEmptyState(`Common phrases for ${country.name} are being prepared.`);
      case 'holidays':
        return holidays && holidays.length > 0 ? (
          <FlatList data={holidays} keyExtractor={(item) => item.id} renderItem={({ item }) => <HolidayCard holiday={item} />} {...listProps} />
        ) : renderEmptyState(`Holiday information for ${country.name} will be listed here soon.`);
      case 'news':
        return news && news.length > 0 ? (
          <FlatList data={news} keyExtractor={(item) => item.url || item.id} renderItem={({ item }) => <NewsCard article={item} />} {...listProps} />
        ) : renderEmptyState(`Fetching the latest local news for ${country.name}.`);
      default: return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: screenTheme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <Animated.View style={[styles.stickyHeaderContainer, { opacity: headerBackgroundOpacity }]}>
        <BlurView intensity={Platform.OS === 'ios' ? 90 : 95} tint="dark" style={StyleSheet.absoluteFill}>
          <Animated.View style={[styles.stickyHeaderContent, { opacity: headerTitleOpacity }]}>
            <Text variant="subheading" weight="bold" style={[styles.stickyHeaderTitle, {color: screenTheme.stickyHeaderTitleColor}]} numberOfLines={1}>
              {country.name}
            </Text>
          </Animated.View>
        </BlurView>
      </Animated.View>

      <TouchableOpacity style={styles.backButtonContainer} onPress={() => router.back()} activeOpacity={0.8} >
        <View style={styles.backButtonCircle}><ArrowLeft size={24} color={screenTheme.textOnImage} /></View>
      </TouchableOpacity>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
      >
        <View style={[styles.heroContainer, { height: HERO_IMAGE_HEIGHT }]}>
          <Animated.View style={[styles.heroImageWrapper, {transform: [{ translateY: heroImageTranslateY }, { scale: heroImageScale }]}]}>
            <Image source={{ uri: country.headerImageUrl || `https://via.placeholder.com/600x400?text=${encodeURIComponent(country.name)}` }} style={styles.heroImage} contentFit="cover" transition={500}/>
            <View style={styles.heroOverlay} />
          </Animated.View>

          <Animated.View style={[styles.heroContent, { opacity: heroContentOpacity}]}>
            <View style={styles.countryPrimaryInfo}>
              <Animated.View style={[{ opacity: flagOpacity }, styles.flagWrapper]}>
                <Image source={{ uri: country.flagUrl }} style={styles.flag} contentFit="cover" transition={300} />
              </Animated.View>
              <View style={styles.countryNameAndRegion}>
                <Text variant="heading" weight="bold" style={[styles.countryName, {color: screenTheme.textOnImage}]}>
                  {country.name}
                </Text>
                <Text variant="body" style={[styles.countryRegion, {color: screenTheme.textOnImage, opacity: 0.9}]}>
                  {country.region}
                </Text>
              </View>
            </View>
            <BookmarkButton
              countryId={country.id.toString()}
              isBookmarked={!!country.isBookmarked} // Ensure boolean
              size={32}
              color={screenTheme.textOnImage}
              bookmarkedColor={screenTheme.accentPink}
            />
          </Animated.View>
        </View>

        <View style={styles.infoCardsOuterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.infoCardsScrollContainer}>
                <InfoCard icon={Building2} label="Capital" value={country.capital || 'N/A'} />
                <InfoCard icon={Languages} label="Language(s)" value={country.languages?.join(', ') || 'N/A'} />
                <InfoCard icon={HandCoins} label="Currency" value={country.currency || 'N/A'} />
                {country.population && <InfoCard icon={User} label="Population" value={country.population} />}
            </ScrollView>
        </View>

        <View style={[styles.tabBarContainer, {backgroundColor: screenTheme.surface, borderBottomColor: screenTheme.tabBarBorder}]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBarScrollContent} >
            {TABS.map(tab => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              const color = isActive ? screenTheme.activeTabColor : screenTheme.inactiveTabColor;
              return (
                <TouchableOpacity key={tab.id} style={[styles.tabItem, isActive && [styles.activeTabItem, {borderBottomColor: screenTheme.activeTabColor}]]} onPress={() => handleTabChange(tab.id)} activeOpacity={0.7}>
                  <TabIcon size={isActive ? 22 : 20} color={color} strokeWidth={isActive ? 2.5 : 2} />
                  <Text variant="label" weight={isActive ? 'bold' : 'medium'} style={[styles.tabItemText, { color }]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.tabContentSection}>
          {renderTabContent()}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

// InfoCard component needs to be defined or imported. Assuming it's a local helper here.
// Ensure its styles also use screenTheme or themed <Text>, <Card> components if it becomes complex.
const InfoCard = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) => (
  <View style={[infoCardStyles.infoCard, {backgroundColor: screenTheme.infoCardBackground}]}>
    <Icon size={24} color={screenTheme.accentPurple} style={infoCardStyles.infoCardIcon} strokeWidth={2}/>
    <View style={infoCardStyles.infoCardTextContainer}>
      <Text variant="label" weight="medium" style={[infoCardStyles.infoCardLabel, {color: screenTheme.infoCardLabel}]} numberOfLines={1}>{label}</Text>
      <Text variant="body" weight="semibold" style={[infoCardStyles.infoCardValue, {color: screenTheme.infoCardValue}]} numberOfLines={2}>{value}</Text>
    </View>
  </View>
);

// Styles for InfoCard, separated for clarity
const infoCardStyles = StyleSheet.create({
  infoCard: {
    width: Dimensions.get('window').width / 2.8, 
    minHeight: 100,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.md,
    alignItems: 'flex-start',
    ...SHADOW.md, // Apply themed shadow
  },
  infoCardIcon: { marginBottom: SPACING.sm },
  infoCardTextContainer: { flex: 1, justifyContent: 'center'},
  infoCardLabel: { fontSize: FONT_SIZE.xs, marginBottom: SPACING.xs / 2, fontFamily: FONT_FAMILY.medium },
  infoCardValue: { fontSize: FONT_SIZE.md, fontFamily: FONT_FAMILY.semibold, flexShrink: 1},
});


// Main styles for CountryDetailScreen
const styles = StyleSheet.create({
  container: { flex: 1 },
  messageContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  errorTitleText: { textAlign: 'center', marginBottom: SPACING.sm /* color set by Text variant */ },
  errorMessageText: { textAlign: 'center', /* color set by Text variant */ lineHeight: (FONT_SIZE.md || 16) * 1.5 },
  stickyHeaderContainer: { position: 'absolute', top: 0, left: 0, right: 0, height: Platform.OS === 'ios' ? 100 : 80, zIndex: 10 },
  stickyHeaderContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: '100%', paddingTop: Platform.OS === 'ios' ? SPACING.xl + SPACING.sm : SPACING.md },
  stickyHeaderTitle: { fontSize: FONT_SIZE.lg, fontFamily: FONT_FAMILY.semibold },
  backButtonContainer: { position: 'absolute', top: Platform.OS === 'ios' ? SPACING.xl + SPACING.xs : SPACING.md + SPACING.xs, left: SPACING.md, zIndex: 20 },
  backButtonCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', ...SHADOW.sm },
  scrollContent: { paddingBottom: SPACING.xxl * 2 },
  heroContainer: { position: 'relative', backgroundColor: screenTheme.surface },
  heroImageWrapper: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  heroContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: SPACING.lg, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', zIndex: 3 },
  countryPrimaryInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: SPACING.sm },
  flagWrapper: {
    width: 64, height: 48, borderRadius: BORDER_RADIUS.md, marginRight: SPACING.md,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)', overflow: 'hidden',
    shadowColor: COLORS.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5,
    backgroundColor: COLORS.neutral?.[300] || '#555'
  },
  flag: { width: '100%', height: '100%' },
  countryNameAndRegion: { flex: 1 },
  countryName: { textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 5 },
  countryRegion: { textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  
  infoCardsOuterContainer: {
    paddingVertical: SPACING.lg,
    backgroundColor: screenTheme.surface,
  },
  infoCardsScrollContainer: {
    paddingHorizontal: SPACING.md,
  },
  // InfoCard styles moved to a separate const infoCardStyles above

  tabBarContainer: { borderBottomWidth: 1, paddingHorizontal: SPACING.xs },
  tabBarScrollContent: { alignItems: 'center' },
  tabItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, paddingHorizontal: SPACING.md, marginRight: SPACING.xs },
  activeTabItem: { borderBottomWidth: 3 },
  tabItemText: { marginLeft: SPACING.xs, fontSize: FONT_SIZE.sm, fontFamily: FONT_FAMILY.medium },
  
  tabContentSection: { paddingTop: SPACING.lg, minHeight: 300, backgroundColor: screenTheme.background /* Ensure tab content area has main bg */ },
  listContentContainer: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.md },
  emptyStateContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl, minHeight: 200 },
  emptyStateText: { 
    textAlign: 'center', 
    // Error 4 Fix: Changed FONT_SIZE.body to FONT_SIZE.md
    lineHeight: (FONT_SIZE?.md || 16) * 1.5 
  },
});