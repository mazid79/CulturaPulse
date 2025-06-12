import { StyleSheet, TouchableOpacity, View, StyleProp, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { COLORS, BORDER_RADIUS, SPACING, SHADOW } from '@/utils/theme';
import { Text } from '@/components/ui/Text';
import { BookmarkButton } from './BookmarkButton';
import { Country } from '@/types';

interface CountryCardProps {
  country: Country;
  style?: StyleProp<ViewStyle>;
}

export function CountryCard({ country, style }: CountryCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/country/${country.id}`);
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      activeOpacity={0.9}
      onPress={handlePress}
    >
      <Image
        source={{ uri: country.headerImageUrl }}
        style={styles.image}
        contentFit="cover"
        transition={300}
      />
      <View style={styles.overlay}>
        <View style={styles.flagContainer}>
          <Image
            source={{ uri: country.flagUrl }}
            style={styles.flag}
            contentFit="cover"
          />
        </View>
        <View style={styles.content}>
          <Text variant="subheading" weight="bold" color={COLORS.white}>
            {country.name}
          </Text>
          <Text variant="caption" color={COLORS.white}>
            {country.region} • {country.capital}
          </Text>
        </View>
        <View style={styles.bookmarkContainer}>
          <BookmarkButton countryId={country.id} isBookmarked={country.isBookmarked} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    height: 180,
    ...SHADOW.md,
    marginBottom: SPACING.md,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: SPACING.md,
  },
  flagContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    marginRight: SPACING.sm,
    ...SHADOW.sm,
  },
  flag: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
  },
  bookmarkContainer: {
    marginLeft: 'auto',
  },
});